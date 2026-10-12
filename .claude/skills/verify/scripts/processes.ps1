param(
    [Parameter(Mandatory)][ValidateSet('record', 'stop')][string]$Mode,
    [Parameter(Mandatory)][string]$File,
    [int[]]$ProcessIds
)

Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;

public static class VerifyProcess
{
    private const uint Terminate = 0x0001;
    private const uint Synchronize = 0x00100000;
    private const uint SuspendResume = 0x0800;
    private const uint QueryLimitedInformation = 0x1000;

    [StructLayout(LayoutKind.Sequential)]
    private struct BasicInformation
    {
        public IntPtr ExitStatus;
        public IntPtr PebBaseAddress;
        public IntPtr AffinityMask;
        public IntPtr BasePriority;
        public IntPtr UniqueProcessId;
        public IntPtr InheritedFromUniqueProcessId;
    }

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr OpenProcess(uint access, bool inherit, int processId);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool CloseHandle(IntPtr handle);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GetProcessTimes(IntPtr handle, out long creation, out long exit, out long kernel, out long user);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool TerminateProcess(IntPtr handle, uint exitCode);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern uint WaitForSingleObject(IntPtr handle, uint milliseconds);

    [DllImport("ntdll.dll")]
    private static extern int NtQueryInformationProcess(IntPtr handle, int infoClass, out BasicInformation info, int size, out int returned);

    [DllImport("ntdll.dll")]
    private static extern int NtSuspendProcess(IntPtr handle);

    public static IntPtr Open(int processId)
    {
        return OpenProcess(Terminate | Synchronize | QueryLimitedInformation | SuspendResume, false, processId);
    }

    public static void Suspend(IntPtr handle)
    {
        int status = NtSuspendProcess(handle);
        if (status != 0 && !HasExited(handle))
        {
            throw new Win32Exception(string.Format("NtSuspendProcess 0x{0:X8}", status));
        }
    }

    public static void Close(IntPtr handle)
    {
        CloseHandle(handle);
    }

    public static long CreationTime(IntPtr handle)
    {
        long creation, exit, kernel, user;
        if (!GetProcessTimes(handle, out creation, out exit, out kernel, out user))
        {
            throw new Win32Exception();
        }
        return creation;
    }

    public static int ParentId(IntPtr handle)
    {
        BasicInformation info;
        int returned;
        int status = NtQueryInformationProcess(handle, 0, out info, Marshal.SizeOf(typeof(BasicInformation)), out returned);
        if (status != 0)
        {
            throw new Win32Exception(string.Format("NtQueryInformationProcess 0x{0:X8}", status));
        }
        return info.InheritedFromUniqueProcessId.ToInt32();
    }

    public static bool HasExited(IntPtr handle)
    {
        return WaitForSingleObject(handle, 0) == 0;
    }

    public static void Kill(IntPtr handle)
    {
        if (!TerminateProcess(handle, 1) && !HasExited(handle))
        {
            throw new Win32Exception();
        }
        WaitForSingleObject(handle, 5000);
    }
}
'@

function Add-Descendants($Tree, $Seen) {
    $added = 0
    for ($i = 0; $i -lt $Tree.Count; $i++) {
        $node = $Tree[$i]
        foreach ($child in Get-CimInstance Win32_Process -Filter "ParentProcessId=$($node.Id)") {
            if ($Seen.ContainsKey([int]$child.ProcessId)) { continue }
            $childHandle = [VerifyProcess]::Open($child.ProcessId)
            if ($childHandle -eq [IntPtr]::Zero) { continue }
            $childCreated = [VerifyProcess]::CreationTime($childHandle)
            if ([VerifyProcess]::ParentId($childHandle) -eq $node.Id -and $childCreated -gt $node.Created) {
                [VerifyProcess]::Suspend($childHandle)
                $Tree.Add([pscustomobject]@{ Id = [int]$child.ProcessId; Handle = $childHandle; Created = $childCreated })
                $Seen[[int]$child.ProcessId] = $true
                $added++
            }
            else {
                [VerifyProcess]::Close($childHandle)
            }
        }
    }
    $added
}

function Stop-Tree([IntPtr]$Handle, [int]$ProcessId, [long]$Created) {
    $tree = [System.Collections.Generic.List[object]]::new()
    $tree.Add([pscustomobject]@{ Id = $ProcessId; Handle = $Handle; Created = $Created })
    $seen = @{ $ProcessId = $true }
    try {
        [VerifyProcess]::Suspend($Handle)
        while ((Add-Descendants $tree $seen) -gt 0) { }
        foreach ($node in $tree) {
            if (-not [VerifyProcess]::HasExited($node.Handle)) {
                [VerifyProcess]::Kill($node.Handle)
                Write-Output "stopped $($node.Id)"
            }
        }
    }
    finally {
        $tree | Select-Object -Skip 1 | ForEach-Object { [VerifyProcess]::Close($_.Handle) }
    }
}

if ($Mode -eq 'record') {
    $ProcessIds | Sort-Object -Unique | ForEach-Object {
        $handle = [VerifyProcess]::Open($_)
        if ($handle -eq [IntPtr]::Zero) { throw "cannot open process $_" }
        try { "$_ $([VerifyProcess]::CreationTime($handle))" }
        finally { [VerifyProcess]::Close($handle) }
    } | Set-Content $File
    return
}

foreach ($line in Get-Content $File) {
    $processId, $created = $line -split ' '
    $handle = [VerifyProcess]::Open([int]$processId)
    if ($handle -eq [IntPtr]::Zero) {
        Write-Output "gone $processId"
        continue
    }
    try {
        if ([VerifyProcess]::CreationTime($handle) -eq [long]$created) {
            Stop-Tree $handle ([int]$processId) ([long]$created)
        }
        else {
            Write-Output "skipped ${processId}: PID now belongs to another process"
        }
    }
    finally { [VerifyProcess]::Close($handle) }
}
