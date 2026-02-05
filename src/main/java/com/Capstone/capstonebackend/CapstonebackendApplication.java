package com.Capstone.capstonebackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan("com.Capstone")
public class CapstonebackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CapstonebackendApplication.class, args);
	}

}
