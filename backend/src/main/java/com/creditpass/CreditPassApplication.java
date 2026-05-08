package com.creditpass;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@MapperScan("com.creditpass.**.mapper")
public class CreditPassApplication {

    public static void main(String[] args) {
        SpringApplication.run(CreditPassApplication.class, args);
        System.out.println("=".repeat(50));
        System.out.println("CreditPassApplication started successfully!");
        System.out.println("=".repeat(50));
    }
}
