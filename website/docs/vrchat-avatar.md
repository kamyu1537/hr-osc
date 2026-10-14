---
sidebar_position: 3
---

# VRChat 아바타 설정

## OSC 파라미터

앱은 OSC로 VRChat에 두 파라미터를 보냅니다.

| 파라미터 | 타입 | 값 |
| --- | --- | --- |
| `hr_connected` | Bool | 심박수를 받는 중이면 `true`, 연결이 끊기면 `false` |
| `hr_percent` | Float | 심박수 / 최대 심박수. 0.0~1.0 범위로 제한됩니다. |

OSC 주소는 각각 `/avatar/parameters/hr_connected`, `/avatar/parameters/hr_percent`입니다.

`hr_percent`는 `심박수 ÷ 최대 심박수`입니다. 최대 심박수 기본값이 `200`이므로 100 bpm이면 `0.5`, 200 bpm 이상이면 `1.0`입니다. 최대 심박수는 [설정](./settings-reference.md)에서 바꿀 수 있습니다.

`hr_connected`가 `false`로 바뀔 때는 `hr_percent`를 보내지 않습니다. 연결이 끊긴 동안에는 마지막으로 받은 값이 남아 있을 수 있으므로, 애니메이터에서 `hr_connected`를 함께 확인하세요.

파라미터 이름은 설정의 `파라미터` 탭에서 바꿀 수 있습니다. 이름을 바꾸면 아바타 쪽 이름도 같게 맞춰야 합니다.

## 아바타에 추가하기

1. 아바타의 Expression Parameters에 `hr_connected`(Bool)와 `hr_percent`(Float)를 추가합니다.
2. 애니메이터 컨트롤러의 파라미터에도 같은 이름과 타입으로 추가합니다.
3. 아바타를 업로드합니다.

### 애니메이터 예시

심박수에 맞춰 하트가 뛰게 하는 예시입니다.

- `hr_percent`(Float)를 Motion Time으로 쓰는 레이어를 만들고, 상태 하나에 하트 크기나 BlendShape 애니메이션을 넣습니다. 클립의 0초를 심박수 0%, 마지막 프레임을 100%로 두면 값에 따라 모양이 달라집니다.
- `hr_connected`(Bool)로 표시 여부를 제어합니다. `hr_connected`가 `true`일 때만 하트가 보이는 상태로 가고, `false`이면 숨기는 상태로 돌아가도록 전이 조건을 둡니다.

## VRChat에서 OSC 켜기

VRChat에서 OSC를 켜야 앱이 보낸 값을 받습니다. Action Menu의 Options → OSC에서 `Enabled`를 켭니다. 앱은 OSC를 `127.0.0.1`의 `9000` 포트로 보내며, 이는 VRChat의 기본 수신 주소입니다. 값을 바꾸는 방법은 [설정 항목 레퍼런스](./settings-reference.md#osc)에 있습니다.

## OSC 설정 초기화

파라미터를 고친 뒤에도 값이 들어오지 않으면 해당 아바타의 OSC 설정을 초기화합니다. 직접 편집한 주소와 타입은 자동으로 복구되지 않으므로 원본 파일을 보관하세요.

1. VRChat을 종료합니다.
2. 아래 경로에서 사용 중인 계정의 `userId` 폴더와 문제가 있는 아바타의 `avatarId.json` 파일을 찾습니다. 파일 안의 `id`와 `name`으로 아바타를 확인합니다.

   ```text
   %USERPROFILE%\AppData\LocalLow\VRChat\VRChat\OSC\{userId}\Avatars\{avatarId}.json
   ```

3. 해당 JSON 파일만 `OSC` 폴더 밖의 백업 폴더로 옮깁니다. 다른 아바타의 파일과 `OSC` 폴더는 그대로 둡니다.
4. VRChat을 실행하고 OSC를 켠 상태로 해당 아바타를 다시 불러옵니다. 파일이 없으면 VRChat이 기본 매핑을 새로 만듭니다.

기존 사용자 매핑이 필요하면 백업과 새 파일을 비교해 필요한 주소와 타입을 다시 적용하세요. 파일 구조는 [VRChat 공식 OSC 문서](https://docs.vrchat.com/docs/osc-avatar-parameters)를 참고하세요.
