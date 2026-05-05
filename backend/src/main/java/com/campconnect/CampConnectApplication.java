package com.campconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class CampConnectApplication {

	public static void main(String[] args) {
		SpringApplication.run(CampConnectApplication.class, args);
	}

}
