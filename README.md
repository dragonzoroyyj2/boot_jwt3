1️⃣ Python 설치 확인

Python 3.10 이상 설치되어 있어야 합니다.

설치 후 터미널에서 확인:

python --version


출력 예시:

Python 3.10.5


pip도 설치 확인:

pip --version

2️⃣ 가상환경 만들기 (선택이지만 권장)

프로젝트마다 패키지 버전을 안전하게 관리하려면 가상환경 추천:

cd D:\project\dev_boot_project\workspace\MyBaseLink\python
python -m venv venv


가상환경 활성화:

# Windows
venv\Scripts\activate


활성화되면 프롬프트가 (venv)로 표시됩니다.

3️⃣ 필수 패키지 설치

KRX 스크립트에서 필요한 패키지:

pandas

requests

lxml

beautifulsoup4 (선택)

설치 명령:

pip install pandas requests lxml beautifulsoup4

4️⃣ 설치 확인

Python에서 아래 명령 실행:

python -c "import pandas; import requests; import lxml; import bs4; print('모두 OK')"


출력:

모두 OK


✅ 여기까지 뜨면 Python 환경과 필수 패키지 세팅 완료




dragonzoroyj04 시작
pip install pandas numpy yfinance openpyxl
