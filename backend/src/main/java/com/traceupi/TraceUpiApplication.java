package com.traceupi;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class TraceUpiApplication {

    public static void main(String[] args) {
        SpringApplication.run(TraceUpiApplication.class, args);
    }

    @PostConstruct
    public void init() {
        // Set JVM timezone to IST
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
    }
}
