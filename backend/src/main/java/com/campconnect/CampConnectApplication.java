package com.campconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
<<<<<<< HEAD
=======
@org.springframework.scheduling.annotation.EnableScheduling
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
public class CampConnectApplication {

	public static void main(String[] args) {
		SpringApplication.run(CampConnectApplication.class, args);
	}

}
