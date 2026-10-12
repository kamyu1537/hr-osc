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

    public static IntPtr Open(int processId)
    {
        return OpenProcess(Terminate | Synchronize | QueryLimitedInformation, false, processId);
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
    }
}
'@

function Stop-Tree([IntPtr]$Handle, [int]$ProcessId, [long]$Created) {
    foreach ($child in Get-CimInstance Win32_Process -Filter "ParentProcessId=$ProcessId") {
        $childHandle = [VerifyProcess]::Open($child.ProcessId)
        if ($childHandle -eq [IntPtr]::Zero) { continue }
        try {
            $childCreated = [VerifyProcess]::CreationTime($childHandle)
            if ([VerifyProcess]::ParentId($childHandle) -eq $ProcessId -and $childCreated -gt $Created) {
                Stop-Tree $childHandle $child.ProcessId $childCreated
            }
        }
        finally { [VerifyProcess]::Close($childHandle) }
    }
    if (-not [VerifyProcess]::HasExited($Handle)) {
        [VerifyProcess]::Kill($Handle)
        Write-Output "stopped $ProcessId"
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
