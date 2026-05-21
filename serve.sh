#!/bin/bash
# FX 학습앱 로컬 서버
PORT=3000
echo "http://localhost:$PORT 에서 실행 중..."
open "http://localhost:$PORT"
python3 -m http.server $PORT
