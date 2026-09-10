package com.transit.SGComplaint.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ReactComplaintPageController {

    @GetMapping({"/react-complaints", "/react-complaints/"})
    public String complaintList() {
        return "forward:/react-complaints/index.html";
    }
}
