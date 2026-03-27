import { Severity, InjuryType, WorkflowStep } from "./types";

interface WorkflowInput {
  severity: Severity;
  injuryType: InjuryType;
}

let stepCounter = 0;
function makeStep(
  partial: Omit<WorkflowStep, "id" | "completed" | "completedAt">
): WorkflowStep {
  stepCounter++;
  return {
    id: `step-${stepCounter}`,
    completed: false,
    completedAt: null,
    ...partial,
  };
}

export function generateWorkflow(input: WorkflowInput): WorkflowStep[] {
  stepCounter = 0;
  const { severity, injuryType } = input;
  const steps: WorkflowStep[] = [];

  // --- SEVERE: Immediate medical care first ---
  if (severity === "severe") {
    steps.push(
      makeStep({
        title: "Seek Immediate Medical Care",
        description:
          "Call 911 or transport the employee to the nearest emergency room immediately. Do not move the employee if a spinal injury is suspected.",
        whyItMatters:
          "Employee safety is the top priority. Delaying medical care for a severe injury can worsen outcomes and creates legal liability.",
        timing: "Immediately",
      })
    );
  }

  // --- All severities: Ensure first aid / medical attention ---
  if (severity !== "severe") {
    steps.push(
      makeStep({
        title: "Provide First Aid or Medical Attention",
        description:
          severity === "minor"
            ? "Administer basic first aid on-site. If the employee requests medical treatment, provide it — you cannot deny this right."
            : "Ensure the employee receives prompt medical evaluation. Offer to transport them to an approved medical provider or urgent care.",
        whyItMatters:
          "Arkansas law requires employers to provide reasonable medical treatment. Even minor injuries can develop complications if untreated.",
        timing: severity === "minor" ? "Immediately" : "Immediately",
      })
    );
  }

  // --- All severities: Secure the scene ---
  if (
    severity === "severe" ||
    injuryType === "machinery" ||
    injuryType === "vehicle_accident" ||
    injuryType === "chemical_exposure"
  ) {
    steps.push(
      makeStep({
        title: "Secure the Incident Scene",
        description:
          "Prevent further injuries by securing the area. Do not disturb the scene — it may be needed for investigation. Take photos if possible.",
        whyItMatters:
          "Preserving evidence protects both the employee and your business. OSHA may investigate serious incidents.",
        timing: "Immediately",
      })
    );
  }

  // --- All severities: Report internally ---
  steps.push(
    makeStep({
      title: "Report the Injury Internally",
      description:
        "Have the employee (or their supervisor) complete an internal incident report. Record the date, time, location, what happened, witnesses, and any immediate actions taken.",
      whyItMatters:
        "A timely internal report establishes the facts while they are fresh. This document becomes the foundation for the entire claim.",
      timing: "Within 24 hours",
    })
  );

  // --- Moderate/Severe: Detailed documentation ---
  if (severity === "moderate" || severity === "severe") {
    steps.push(
      makeStep({
        title: "Gather Detailed Documentation",
        description:
          "Collect witness statements, photographs of the scene, and any relevant safety logs or equipment records. Document the employee's account in their own words.",
        whyItMatters:
          "Thorough documentation protects against disputed claims and helps your insurance carrier process the claim efficiently.",
        timing: "Within 24 hours",
      })
    );
  }

  // --- All severities: File First Report of Injury ---
  steps.push(
    makeStep({
      title: "File the First Report of Injury (Form AR-N)",
      description:
        "Complete and submit Arkansas Form AR-N (Employer's First Report of Injury or Illness) to the Arkansas Workers' Compensation Commission.",
      whyItMatters:
        "Arkansas law requires employers to file this report. Late filing can result in penalties and may jeopardize the claim.",
      timing:
        severity === "severe" ? "Within 24 hours" : "Within 10 days of learning about the injury",
      officialLink: {
        label: "Arkansas WCC — Forms & Filing",
        url: "https://www.awcc.state.ar.us/forms.html",
      },
    })
  );

  // --- All severities: Notify insurance carrier ---
  steps.push(
    makeStep({
      title: "Notify Your Insurance Carrier",
      description:
        "Contact your workers' compensation insurance carrier to report the claim. Provide them with a copy of the incident report and Form AR-N.",
      whyItMatters:
        "Your carrier manages the claim, authorizes treatment, and handles payments. Delayed notification can complicate coverage.",
      timing:
        severity === "severe"
          ? "Immediately"
          : "Within 24–48 hours",
    })
  );

  // --- Severe: Consider legal consultation ---
  if (severity === "severe") {
    steps.push(
      makeStep({
        title: "Consider Consulting a Workers' Comp Attorney",
        description:
          "For severe injuries, it may be prudent to consult with an attorney who specializes in Arkansas workers' compensation law to understand your obligations and exposure.",
        whyItMatters:
          "Severe injuries often involve extended disability, higher costs, and potential disputes. Early legal guidance can prevent costly mistakes.",
        timing: "Within 48 hours",
      })
    );
  }

  // --- All severities: Provide employee with rights information ---
  steps.push(
    makeStep({
      title: "Inform the Employee of Their Rights",
      description:
        "Provide the employee with information about their workers' compensation rights, including their right to medical treatment, temporary disability benefits, and the claims process.",
      whyItMatters:
        "Arkansas law requires employers to inform injured workers of their rights. Failure to do so can result in penalties and erode employee trust.",
      timing: "Within 48 hours",
      officialLink: {
        label: "Arkansas WCC — Employee Rights",
        url: "https://www.awcc.state.ar.us/employee.html",
      },
    })
  );

  // --- Moderate/Severe: Return-to-work planning ---
  if (severity === "moderate" || severity === "severe") {
    steps.push(
      makeStep({
        title: "Begin Return-to-Work Planning",
        description:
          "Work with the treating physician and your insurance carrier to establish a return-to-work plan. Consider light-duty or modified work assignments if available.",
        whyItMatters:
          "Early return-to-work planning reduces claim costs and helps the employee recover faster. Arkansas encourages employers to offer modified duty.",
        timing: "Within 1 week",
      })
    );
  }

  // --- All severities: Follow up ---
  steps.push(
    makeStep({
      title: "Follow Up and Monitor Progress",
      description:
        severity === "minor"
          ? "Check in with the employee within a few days to confirm the injury is healing and no further treatment is needed."
          : "Maintain regular contact with the employee, their medical provider, and your insurance carrier. Track treatment progress and any work restrictions.",
      whyItMatters:
        "Ongoing follow-up demonstrates good faith, catches complications early, and keeps the claim on track for resolution.",
      timing:
        severity === "minor"
          ? "Within 3–5 days"
          : "Ongoing — weekly check-ins recommended",
    })
  );

  // --- OSHA reporting for severe injuries ---
  if (
    severity === "severe" ||
    injuryType === "vehicle_accident" ||
    injuryType === "chemical_exposure"
  ) {
    steps.push(
      makeStep({
        title: "Evaluate OSHA Reporting Requirements",
        description:
          "Determine if this injury requires OSHA reporting. Hospitalizations, amputations, and loss of an eye must be reported within 24 hours. Fatalities must be reported within 8 hours.",
        whyItMatters:
          "Federal law requires OSHA reporting for serious injuries. Failure to report carries significant fines.",
        timing: "Within 24 hours of incident",
        officialLink: {
          label: "OSHA Injury Reporting",
          url: "https://www.osha.gov/report",
        },
      })
    );
  }

  // --- All severities: Record keeping ---
  steps.push(
    makeStep({
      title: "Maintain Your Records",
      description:
        "Keep copies of all incident reports, medical records, Form AR-N, insurance correspondence, and return-to-work documentation in a secure file. Retain records for at least 5 years.",
      whyItMatters:
        "Complete records protect you in case of audits, disputes, or future claims related to the same injury.",
      timing: "Ongoing",
    })
  );

  return steps;
}
