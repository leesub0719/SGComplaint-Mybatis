package com.transit.SGComplaint.controller;

import com.transit.SGComplaint.DTO.MemberPasswordConfirmRequest;
import com.transit.SGComplaint.DTO.MemberProfileUpdateRequest;
import com.transit.SGComplaint.DTO.MyPageApiResponse;
import com.transit.SGComplaint.DTO.MyPageProfileResponse;
import com.transit.SGComplaint.domain.Employee;
import com.transit.SGComplaint.service.EmployeeService;
import com.transit.SGComplaint.service.ProfileVerificationSession;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 마이페이지 정보수정 화면의 JSON API.
 *
 * <p>기존 {@link MyPageController}(폼 submit + redirect)와 같은 서비스·세션 게이트를
 * 사용하므로 Thymeleaf 화면과 React 화면을 동시에 열어둬도 상태가 어긋나지 않는다.</p>
 */
@RestController
@RequestMapping("/api/mypage")
public class MyPageApiController {

    private final EmployeeService employeeService;
    private final ProfileVerificationSession verificationSession;

    public MyPageApiController(
            EmployeeService employeeService,
            ProfileVerificationSession verificationSession) {
        this.employeeService = employeeService;
        this.verificationSession = verificationSession;
    }

    /** 초기 로딩: 재확인 통과 여부 + (통과했다면) 수정 폼 초기값. */
    @GetMapping("/profile")
    public MyPageProfileResponse profile(
            Authentication authentication,
            HttpSession session) {
        Employee employee = employeeService.getRequiredActiveEmployee(authentication.getName());
        if (!verificationSession.isVerified(session)) {
            return MyPageProfileResponse.locked(employee);
        }
        return MyPageProfileResponse.unlocked(
                employee,
                employeeService.getProfileUpdateForm(authentication.getName()),
                verificationSession.remainingMillis(session));
    }

    /** 비밀번호 재확인. 성공하면 세션 게이트를 10분간 열어준다. */
    @PostMapping("/profile/confirm-password")
    public ResponseEntity<MyPageApiResponse> confirmPassword(
            Authentication authentication,
            @Valid @RequestBody MemberPasswordConfirmRequest request,
            HttpSession session) {
        if (!employeeService.matchesCurrentPassword(
                authentication.getName(), request.getCurrentPassword())) {
            return ResponseEntity.badRequest().body(
                    MyPageApiResponse.fieldError(
                            "currentPassword", "현재 비밀번호가 일치하지 않습니다."));
        }
        verificationSession.markVerified(session);
        return ResponseEntity.ok(MyPageApiResponse.ok("비밀번호가 확인되었습니다."));
    }

    /** 회원정보 저장. */
    @PostMapping("/profile")
    public ResponseEntity<MyPageApiResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody MemberProfileUpdateRequest request,
            HttpSession session) {
        if (!verificationSession.isVerified(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    MyPageApiResponse.fail("비밀번호 재확인이 만료되었습니다. 다시 확인해 주세요."));
        }
        if (!request.passwordMatches()) {
            return ResponseEntity.badRequest().body(
                    MyPageApiResponse.fieldError(
                            "newPasswordConfirm",
                            "새 비밀번호와 비밀번호 확인이 일치하지 않습니다."));
        }

        employeeService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(MyPageApiResponse.ok("회원정보가 저장되었습니다."));
    }

    /** 회원탈퇴. 성공하면 인증 정보와 세션을 정리한다. */
    @PostMapping("/withdraw")
    public ResponseEntity<MyPageApiResponse> withdraw(
            Authentication authentication,
            HttpServletRequest servletRequest,
            HttpSession session) {
        if (!verificationSession.isVerified(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    MyPageApiResponse.fail("비밀번호 재확인이 만료되었습니다. 다시 확인해 주세요."));
        }

        employeeService.withdraw(authentication.getName());

        SecurityContextHolder.clearContext();
        HttpSession current = servletRequest.getSession(false);
        if (current != null) {
            current.invalidate();
        }
        return ResponseEntity.ok(MyPageApiResponse.ok("회원탈퇴가 완료되었습니다."));
    }
}
