package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SimilarStockAdvancedService2 {

    private final String dataDir = "C:\\LocBootProject\\workspace\\demo\\data\\krx"; // CSV 저장 경로

    public List<Map<String, Object>> getSimilarStocks(String company, LocalDate startDate, LocalDate endDate) {
        try {
            // 기준 종목 CSV 로드
            Path baseFile = Paths.get(dataDir, company + ".csv");
            if (!Files.exists(baseFile)) return Collections.emptyList();

            List<String[]> baseData = Files.lines(baseFile)
                    .skip(1)
                    .map(line -> line.split(","))
                    .collect(Collectors.toList());

            // 다른 종목 파일들 비교
            List<Map<String, Object>> result = new ArrayList<>();
            Files.list(Paths.get(dataDir))
                    .filter(f -> !f.getFileName().toString().equals(company + ".csv"))
                    .forEach(path -> {
                        try {
                            List<String[]> compareData = Files.lines(path)
                                    .skip(1)
                                    .map(l -> l.split(","))
                                    .collect(Collectors.toList());

                            double distance = calculateDTW(baseData, compareData, startDate, endDate);

                            Map<String, Object> map = new HashMap<>();
                            map.put("file", path.getFileName().toString());
                            map.put("distance", distance);

                            // 날짜 / 종가 정보
                            List<String> dates = compareData.stream()
                                    .map(arr -> arr[0])
                                    .collect(Collectors.toList());
                            List<String> prices = compareData.stream()
                                    .map(arr -> arr[4]) // 종가 컬럼 기준
                                    .collect(Collectors.toList());
                            map.put("dates", dates);
                            map.put("prices", prices);

                            result.add(map);
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    });

            // DTW 거리 기준 정렬
            result.sort(Comparator.comparingDouble(m -> (Double) m.get("distance")));
            return result;

        } catch (IOException e) {
            throw new RuntimeException("CSV 파일 처리 오류", e);
        }
    }

    // 단순 예시용 DTW 거리 계산 (실제 DTW 알고리즘으로 대체 가능)
    private double calculateDTW(List<String[]> base, List<String[]> compare, LocalDate start, LocalDate end) {
        // 간단히 종가 평균 차이 계산 (실제 DTW 구현 필요)
        double sum = 0;
        int count = 0;
        for (int i = 0; i < Math.min(base.size(), compare.size()); i++) {
            double basePrice = Double.parseDouble(base.get(i)[4]);
            double cmpPrice = Double.parseDouble(compare.get(i)[4]);
            sum += Math.abs(basePrice - cmpPrice);
            count++;
        }
        return count == 0 ? 0 : sum / count;
    }
}
