import sys
import csv
import os

# argv: [script, company, start, end, output_path]
if len(sys.argv) < 5:
    print("Usage: python find_similar_full.py [company] [start_date] [end_date] [output_csv_path]")
    sys.exit(1)

company = sys.argv[1]
start_date = sys.argv[2]
end_date = sys.argv[3]
output_path = sys.argv[4]

print(f"회사명: {company}")
print(f"조회기간: {start_date} ~ {end_date}")
print(f"CSV 결과 저장: {output_path}")

# 더미 데이터 (실제 로직 대신)
data = [
    ["삼성전자", "0.124", "2024-03-07;2024-03-08;2024-03-09", "80000;80500;81000"],
    ["LG전자", "0.178", "2024-03-07;2024-03-08;2024-03-09", "95000;96000;97000"],
    ["NAVER", "0.245", "2024-03-07;2024-03-08;2024-03-09", "210000;211000;212000"]
]

# CSV 생성
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["file", "distance", "dates", "prices"])
    for row in data:
        writer.writerow(row)

print("CSV 파일 생성 완료:", output_path)
