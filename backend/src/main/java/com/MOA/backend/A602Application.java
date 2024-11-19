package com.MOA.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class A602Application {

	public static void main(String[] args) {
		SpringApplication.run(A602Application.class, args);
	}

}
