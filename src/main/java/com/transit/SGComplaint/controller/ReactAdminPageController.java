package com.transit.SGComplaint.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * React 관리자 화면 진입점.
 *
 * <p>이 앱은 react-router를 쓰므로 하위 경로(/dashboard, /complaints, /members)를
 * 브라우저가 직접 요청할 수 있다. 그 경로들이 서버에 404가 되지 않도록 모두 같은
 * index.html로 forward 한다. 앞의 화면들과 달리 라우터를 도입했기 때문에 필요한
 * 처리다.</p>
 */
@Controller
public class ReactAdminPageController {

    @GetMapping({
            "/react-admin",
            "/react-admin/",
            "/react-admin/dashboard",
            "/react-admin/complaints",
            "/react-admin/members"
    })
    public String adminApp() {
        return "forward:/react-admin/index.html";
    }
}
