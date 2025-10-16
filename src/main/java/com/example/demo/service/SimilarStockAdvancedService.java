package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SimilarStockAdvancedService {

    private final String dataDir = "C:\\LocBootProject\\workspace\\demo\\data\\krx";

    public List<Map<String, Object>> getSimilarStocks(String company, LocalDate startDate, LocalDate endDate) {
        try {
            Path baseFile = Paths.get(dataDir, company + ".csv");
            if (!Files.exists(baseFile)) return Collections.emptyList();

            List<String[]> baseData = Files.lines(baseFile)
                    .skip(1)
                    .map(line -> line.split(","))
                    .filter(arr -> !arr[0].isEmpty())
                    .collect(Collectors.toList());

            List<Map<String, Object>> result = new ArrayList<>();
            Files.list(Paths.get(dataDir))
                    .filter(f -> !f.getFileName().toString().equals(company + ".csv"))
                    .forEach(path -> {
                        try {
                            List<String[]> cmpData = Files.lines(path)
                                    .skip(1)
                                    .map(l -> l.split(","))
                                    .filter(arr -> !arr[0].isEmpty())
                                    .collect(Collectors.toList());

                            // DTW 거리 계산
                            double distance = dtwDistance(
                                    extractPrices(baseData, startDate, endDate),
                                    extractPrices(cmpData, startDate, endDate)
                            );

                            Map<String, Object> map = new HashMap<>();
                            map.put("file", path.getFileName().toString());
                            map.put("distance", distance);

                            // 날짜 / 종가 전달
                            map.put("dates", cmpData.stream().map(arr -> arr[0]).collect(Collectors.toList()));
                            map.put("prices", cmpData.stream().map(arr -> arr[4]).collect(Collectors.toList()));

                            result.add(map);

                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    });

            // DTW 기준 오름차순 정렬
            result.sort(Comparator.comparingDouble(m -> (Double) m.get("distance")));
            return result;

        } catch (IOException e) {
            throw new RuntimeException("CSV 처리 오류", e);
        }
    }

    // CSV 데이터에서 start ~ end 구간 종가만 추출
    private List<Double> extractPrices(List<String[]> data, LocalDate start, LocalDate end) {
        List<Double> prices = new ArrayList<>();
        for (String[] arr : data) {
            LocalDate date = LocalDate.parse(arr[0]);
            if ((date.isEqual(start) || date.isAfter(start)) && (date.isEqual(end) || date.isBefore(end))) {
                prices.add(Double.parseDouble(arr[4]));
            }
        }
        return prices;
    }

    // DTW 거리 계산
    private double dtwDistance(List<Double> seq1, List<Double> seq2) {
        int n = seq1.size();
        int m = seq2.size();
        double[][] dtw = new double[n + 1][m + 1];

        for (int i = 0; i <= n; i++) Arrays.fill(dtw[i], Double.POSITIVE_INFINITY);
        dtw[0][0] = 0;

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                double cost = Math.abs(seq1.get(i - 1) - seq2.get(j - 1));
                dtw[i][j] = cost + Math.min(Math.min(dtw[i - 1][j], dtw[i][j - 1]), dtw[i - 1][j - 1]);
            }
        }
        return dtw[n][m];
    }
}
