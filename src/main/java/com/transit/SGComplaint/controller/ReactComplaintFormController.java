package com.transit.SGComplaint.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * React 민원 작성 화면 진입점.
 *
 * <p>민원 등록 API({@code POST /complaints})는 이미 JSON을 반환하는
 * {@code @ResponseBody} 메서드라서, 이 화면 전환에는 새 API가 필요 없다.
 * 분류별 문구(제목·안내·배경 이미지)는 서버 Model 대신 React의
 * {@code lib/categories.js}가 들고 있다.</p>
 *
 * <p>로그인이 필요한 화면이며, {@code SecurityConfig}의
 * {@code anyRequest().authenticated()}가 이를 보장한다.</p>
 */
@Controller
public class ReactComplaintFormController {

    @GetMapping({"/react-complaint-new", "/react-complaint-new/"})
    public String complaintForm() {
        return "forward:/react-complaint-new/index.html";
    }
}
