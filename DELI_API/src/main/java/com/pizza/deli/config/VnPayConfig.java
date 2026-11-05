package com.pizza.deli.config;

public class VnPayConfig {
    public static final String vnp_Version = "2.1.0";
    public static final String vnp_Command = "pay";
    public static final String vnp_TmnCode = "ZSS7Y0O5";
    public static final String vnp_HashSecret = "BNQNJZLHEKPIWOUEDCVOZEFZWNVFYCWO";
    public static final String vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public static final String vnp_ReturnUrl = "http://localhost:8080/api/Order/vnpay-return";
}
