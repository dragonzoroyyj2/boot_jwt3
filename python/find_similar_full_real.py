import pandas as pd
import json
from datetime import datetime

def load_csv(file_path):
    """CSV 파일 로드"""
    return pd.read_csv(file_path)

def normalize_series(series):
    """종가 기준 0~1 정규화"""
    return (series - series.min()) / (series.max() - series.min())

def similarity_score(base_series, target_series):
    """단순 절대 차이 합으로 유사도 계산"""
    return ((base_series - target_series).abs()).mean()

def find_similar_stocks(base_stock_df, other_stocks_df, start_date, end_date, threshold=0.05):
    """비슷한 종목 찾기"""
    # 날짜 필터링
    base_range = base_stock_df[(base_stock_df['date'] >= start_date) & (base_stock_df['date'] <= end_date)]
    if base_range.empty:
        return []

    base_close_norm = normalize_series(base_range['close'])
    similar_stocks = []

    for stock_name, df in other_stocks_df.groupby('name'):
        compare_range = df[(df['date'] >= start_date) & (df['date'] <= end_date)]
        if len(compare_range) != len(base_range):
            continue

        compare_close_norm = normalize_series(compare_range['close'])
        score = similarity_score(base_close_norm, compare_close_norm)
        if score <= threshold:
            similar_stocks.append({"name": stock_name, "score": round(score, 4)})

    return similar_stocks

def main():
    kr_stock_file = "csv/kr_stock.csv"  # 기준 종목 CSV
    other_stocks_file = "csv/other_stocks.csv"  # 비교 종목 CSV

    kr_stock_df = load_csv(kr_stock_file)
    other_stocks_df = load_csv(other_stocks_file)

    start_date = "2025-01-01"
    end_date = "2025-10-15"

    result = find_similar_stocks(kr_stock_df, other_stocks_df, start_date, end_date)
    print(json.dumps({"similar_stocks": result}, ensure_ascii=False))

if __name__ == "__main__":
    main()
