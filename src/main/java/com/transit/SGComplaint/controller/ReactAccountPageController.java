package com.transit.SGComplaint.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * React 계정 화면(회원가입 / 아이디 찾기 / 비밀번호 재설정) 진입점.
 *
 * <p>SPA 내부에서 경로를 직접 다루므로 하위 경로 전부를 같은 index.html로
 * forward 한다. 새로고침이나 URL 직접 입력에도 화면이 유지된다.</p>
 */
@Controller
public class ReactAccountPageController {

    @GetMapping({
            "/react-account",
            "/react-account/",
            "/react-account/signup",
            "/react-account/find-id",
            "/react-account/reset-password"
    })
    public String accountApp() {
        return "forward:/react-account/index.html";
    }
}
