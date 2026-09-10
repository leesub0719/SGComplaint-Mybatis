package com.transit.SGComplaint.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * React 마이페이지 진입점.
 *
 * <p>{@code ReactComplaintPageController}와 동일한 패턴으로, 빌드 산출물
 * {@code static/react-mypage/index.html}을 forward 한다.</p>
 */
@Controller
public class ReactMyPageController {

    @GetMapping({"/react-mypage", "/react-mypage/"})
    public String profile() {
        return "forward:/react-mypage/index.html";
    }
}
