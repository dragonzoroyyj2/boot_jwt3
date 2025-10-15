package com.example.demo.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;

import org.springframework.stereotype.Service;

@Service
public class StockService {

    public String getSimilarStocks() throws Exception {
        ProcessBuilder pb = new ProcessBuilder("python", "python/find_similar.py");
        pb.redirectErrorStream(true);
        Process process = pb.start();

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        process.waitFor();
        return sb.toString(); // JSON 문자열 반환
    }
}
