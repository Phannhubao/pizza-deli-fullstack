package com.pizza.deli.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import com.pizza.deli.config.CustomStatusResponse;
import com.pizza.deli.config.GetDataErrorUtils;
import com.pizza.deli.dto.OrderDTO;
import com.pizza.deli.dto.PaymentDTO;
import com.pizza.deli.service.PaymentService;

import java.util.List;


@CrossOrigin
@RestController
@RequestMapping("/api/Payment")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @Autowired
    private CustomStatusResponse customStatusResponse;

    @Autowired
    private GetDataErrorUtils getDataErrorUtils;

    @GetMapping("/GetPaymentList")
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        try {
            List<PaymentDTO> Payments = paymentService.getAllPayments();
            if (Payments.isEmpty()) {
                return customStatusResponse.NOTFOUND404("No Payment found");

            }
            return customStatusResponse.OK200("Get List of Payment Successfully", Payments);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }

    @GetMapping("/GetPaymentByOrderId/{orderID}")
    public ResponseEntity<PaymentDTO> getPaymentByOrderID(@PathVariable Long orderID) {
        try {
            PaymentDTO Payments = paymentService.getPaymentsByOrderID(orderID);
            if (Payments == null) {
                return customStatusResponse.NOTFOUND404("No Payment found");
            }
            return customStatusResponse.OK200("Get List of Payment Successfully", Payments);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }


    @PostMapping("/AddPayment")
    public ResponseEntity<PaymentDTO> createPayment(@RequestBody PaymentDTO PaymentDTO, BindingResult rs) {
        try {
            if(rs.hasErrors()){
                var errors = getDataErrorUtils.DataError(rs);
                return customStatusResponse.BADREQUEST400("Provider data is incorrect",errors);
            }
            PaymentDTO createdPayment = paymentService.createPayment(PaymentDTO);
            if(createdPayment == null ){
                return customStatusResponse.BADREQUEST400("Have error when create Payment !");
            }
            return customStatusResponse.CREATED201("Payment created", createdPayment);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }

    }


    @PutMapping("/UpdateStatusPayment/{orderId}")
    public ResponseEntity<OrderDTO> updatePaymentStatus(@PathVariable Long orderId, @RequestBody Boolean status) {
        try {
            Boolean updatedPaymentStatus = paymentService.updateStatus(orderId,status);
            if (updatedPaymentStatus == false) {
                return customStatusResponse.NOTFOUND404("Payment not found");
            }
            return customStatusResponse.OK200("Payment Status updated");
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }
}
