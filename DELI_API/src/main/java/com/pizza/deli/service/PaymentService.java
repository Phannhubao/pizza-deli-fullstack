package com.pizza.deli.service;



import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pizza.deli.dto.PaymentDTO;
import com.pizza.deli.model.Order;
import com.pizza.deli.model.Payment;
import com.pizza.deli.repository.OrderRepository;
import com.pizza.deli.repository.PaymentRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ModelMapper modelMapper;


    public List<PaymentDTO> getAllPayments() {
        List<Payment> payments = paymentRepository.findAll();
        List<PaymentDTO> PaymentDTOs = new ArrayList<>();
        for (Payment payment : payments) {
            PaymentDTO PaymentDTO = convertToDTO(payment);
            try {
                PaymentDTO.setOrderId(payment.getOrderPayment().getOrderId());
                PaymentDTOs.add(PaymentDTO);
            } catch (Exception e) {
                PaymentDTOs.add(PaymentDTO);
            }
        }
        return PaymentDTOs;
    }

    public PaymentDTO getPaymentsByOrderID(Long orderID) {
        Optional<Order> orderExits = orderRepository.findByOrderId(orderID);
        Order order = orderExits.get();
        Optional<Payment> paymentsOptional = paymentRepository.findByOrderPayment(order);
        Payment payment = paymentsOptional.get();
        PaymentDTO paymentDTO = convertToDTO(payment);
        paymentDTO.setOrderId(payment.getOrderPayment().getOrderId());
        return paymentDTO;
    }

    public Boolean updateStatus(Long orderId, Boolean status) {
        Optional<Order> orderExits = orderRepository.findByOrderId(orderId);
        Order order = orderExits.get();
        Optional<Payment> paymentOptional = paymentRepository.findByOrderPayment(order);
        Payment payment = paymentOptional.get();
        if(paymentOptional.isPresent()) {
            payment.setStatus(status);
            Payment saved = paymentRepository.save(payment);
            return  true;
        }
        return false;
    }


    public PaymentDTO createPayment(PaymentDTO PaymentDTO) {
        try {
            Optional<Order> orderExits = orderRepository.findByOrderId(PaymentDTO.getOrderId());
            if(orderExits.isPresent()) {
                Order order = orderExits.get();
                Payment payment = modelMapper.map(PaymentDTO, Payment.class);
                payment.setOrderPayment(order);
                Payment saved = paymentRepository.save(payment);
                return convertToDTO(saved);
            } else {
                return null;
            }

        } catch (Exception e) {
            e.getMessage();
        }
        return null;

    }
    private PaymentDTO convertToDTO(Payment payment) {
        return modelMapper.map(payment, PaymentDTO.class);
    }
}
