package com.example.demo.controller;

import com.example.demo.service.SimilarStockAdvancedService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
public class SimilarStockAdvancedController {

    private final SimilarStockAdvancedService service;

    public SimilarStockAdvancedController(SimilarStockAdvancedService service) {
        this.service = service;
    }

    @GetMapping("/api/krx/similar-advanced")
    public List<Map<String, Object>> getSimilar(
            @RequestParam String company,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return service.getSimilarStocks(company, start, end);
    }
}
