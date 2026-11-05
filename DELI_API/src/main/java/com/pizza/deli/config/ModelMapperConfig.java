package com.pizza.deli.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.pizza.deli.dto.OrderDTO;
import com.pizza.deli.model.Order;

@Configuration
public class ModelMapperConfig {
	@Bean
	public ModelMapper modelMapper() {
	    ModelMapper modelMapper = new ModelMapper();
	    modelMapper.getConfiguration()
	    	.setMatchingStrategy(MatchingStrategies.STRICT)
	        .setFieldMatchingEnabled(true)
	        .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE);
	    modelMapper.typeMap(Order.class, OrderDTO.class).addMappings(mapper -> {
            mapper.map(Order::getStatus, OrderDTO::setStatus);
        });
	    return modelMapper;
	}
    
}

