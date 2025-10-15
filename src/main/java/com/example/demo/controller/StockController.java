package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.demo.service.StockService;

@Controller
public class StockController {

    @Autowired
    private StockService stockService;

    @GetMapping("/pages/stock/**")
    public String showStocks(Model model) {
        try {
            // Python 스크립트 호출 후 JSON 문자열 반환
            String jsonResult = stockService.getSimilarStocks();

            // Thymeleaf에서 바로 파싱 가능하게 model에 전달
            model.addAttribute("stockData", jsonResult);

        } catch (Exception e) {
            // 에러 발생 시 로깅 및 기본값 전달
            e.printStackTrace();
            model.addAttribute("stockData", "[]"); // 빈 배열 전달
        }

        // stock.html 반환
        return "pages/stocks/stock"; 
        // templates/pages/stocks/stock.html 경로에 맞춰서 수정
    }
}
