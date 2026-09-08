package com.transit.SGComplaint.controller;

import com.transit.SGComplaint.DTO.EmployeeSignupRequest;
import com.transit.SGComplaint.DTO.SignupAgreementEvidence;
import com.transit.SGComplaint.DTO.SignupAgreementRequest;
import com.transit.SGComplaint.service.DuplicateEmployeeIdException;
import com.transit.SGComplaint.service.EmployeeService;
import com.transit.SGComplaint.service.PhoneVerificationException;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

@Controller
public class MemberController {

    private static final String SIGNUP_AGREEMENT_SESSION =
            "signupAgreementEvidence";
    private static final String TERMS_VERSION = "2026-09-04";
    private static final String PRIVACY_VERSION = "2026-09-07";
    private static final Duration AGREEMENT_VALID_DURATION =
            Duration.ofMinutes(30);

    private final EmployeeService employeeService;

    public MemberController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/signup")
    public String signupForm(Model model, HttpSession session) {
        if (getValidAgreement(session) == null) {
            return "redirect:/signup/terms";
        }
        if (!model.containsAttribute("signupForm")) {
            model.addAttribute("signupForm", new EmployeeSignupRequest());
        }
        return "member/signup";
    }

    @GetMapping("/signup/terms")
    public String signupAgreementForm(Model model) {
        if (!model.containsAttribute("agreementForm")) {
            model.addAttribute("agreementForm", new SignupAgreementRequest());
        }
        model.addAttribute("termsVersion", TERMS_VERSION);
        model.addAttribute("privacyVersion", PRIVACY_VERSION);
        return "member/signup-terms";
    }

    @PostMapping("/signup/terms")
    public String acceptSignupAgreement(
            @Valid @ModelAttribute("agreementForm") SignupAgreementRequest request,
            BindingResult bindingResult,
            HttpSession session,
            Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("termsVersion", TERMS_VERSION);
            model.addAttribute("privacyVersion", PRIVACY_VERSION);
            return "member/signup-terms";
        }

        session.setAttribute(
                SIGNUP_AGREEMENT_SESSION,
                new SignupAgreementEvidence(
                        TERMS_VERSION,
                        PRIVACY_VERSION,
                        LocalDateTime.now()));
        return "redirect:/signup";
    }

    @PostMapping("/signup")
    public String signup(
            @Valid @ModelAttribute("signupForm") EmployeeSignupRequest request,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes,
            HttpSession session) {

        SignupAgreementEvidence agreement = getValidAgreement(session);
        if (agreement == null) {
            return "redirect:/signup/terms";
        }

        if (!request.passwordMatches()) {
            bindingResult.rejectValue(
                    "passwordConfirm",
                    "password.mismatch",
                    "비밀번호와 비밀번호 확인이 일치하지 않습니다."
            );
        }

        if (bindingResult.hasErrors()) {
            return "member/signup";
        }

        try {
            Long empNo = employeeService.signupUser(request, agreement);
            session.removeAttribute(SIGNUP_AGREEMENT_SESSION);
            redirectAttributes.addFlashAttribute("empNo", empNo);
            return "redirect:/signup/complete";
        } catch (DuplicateEmployeeIdException exception) {
            bindingResult.rejectValue(
                    "empId",
                    "empId.duplicate",
                    exception.getMessage()
            );
            return "member/signup";
        } catch (PhoneVerificationException exception) {
            bindingResult.rejectValue(
                    "empPhone",
                    "phone.verification.invalid",
                    exception.getMessage()
            );
            return "member/signup";
        }
    }

    @GetMapping("/signup/complete")
    public String signupComplete() {
        return "member/signup-complete";
    }

    @GetMapping("/account/find-id")
    public String findId() {
        return "member/find-id";
    }

    @GetMapping("/account/reset-password")
    public String resetPassword() {
        return "member/reset-password";
    }

    @GetMapping("/api/members/check-id")
    @ResponseBody
    public Map<String, Boolean> checkDuplicateId(
            @RequestParam(name = "empId") String empId) {

        boolean available = employeeService.isEmpIdAvailable(empId);
        return Map.of("available", available);
    }

    private SignupAgreementEvidence getValidAgreement(HttpSession session) {
        Object value = session.getAttribute(SIGNUP_AGREEMENT_SESSION);
        if (!(value instanceof SignupAgreementEvidence evidence)) {
            return null;
        }

        boolean correctVersion = TERMS_VERSION.equals(evidence.termsVersion())
                && PRIVACY_VERSION.equals(evidence.privacyVersion());
        boolean expired = evidence.agreedAt() == null
                || evidence.agreedAt().plus(AGREEMENT_VALID_DURATION)
                        .isBefore(LocalDateTime.now());
        if (!correctVersion || expired) {
            session.removeAttribute(SIGNUP_AGREEMENT_SESSION);
            return null;
        }
        return evidence;
    }
}
