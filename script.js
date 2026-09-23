const features = {
  people: {
    number: "01 / PEOPLE & MEMBERSHIP",
    title: "A clearer record of the people in your church.",
    intro:
      "A shared directory gives administrators a steadier starting point for welcoming people, keeping contact details current, and recognizing membership.",
    release: "First release",
    overview:
      "People records are the foundation for service attendance and church administration. Membership is a recognized standing recorded by an administrator.",
    example:
      "After the church completes its membership process, an administrator records the people who have been recognized. Visiting often does not automatically make someone a member.",
    points: [
      "Keep a usable directory for authorized staff.",
      "Record membership after the church’s recognition process.",
      "Use the person record as a reference for related church activity.",
    ],
    boundary:
      "Attendance by itself never changes a person’s membership status.",
  },
  attendance: {
    number: "02 / SUNDAY ATTENDANCE",
    title: "Count the check-ins that were actually recorded.",
    intro:
      "A service-day workflow could help staff find a person and record their attendance. Each service total comes from distinct individual check-ins.",
    release: "First release",
    overview:
      "Sunday services are the starting point. If the same person is checked in twice for one service, that still counts as one recorded attendance for that service.",
    example:
      "A team member records Ama at the 9:00 service. If she also attends the 11:00 service, each service total includes her, while the day’s unique-person count includes her once.",
    points: [
      "Record attendance person by person for a dated service.",
      "Calculate service totals from distinct check-ins.",
      "Correct a mistaken record so totals reflect the update.",
    ],
    boundary:
      "Reports describe recorded attendance, not everyone physically present. Someone who was not checked in is not included.",
  },
  growth: {
    number: "03 / GROWTH REPORTS",
    title: "Make the numbers clear enough to discuss.",
    intro:
      "Reports could help administrators and leaders review what the records show, with each measure tied to a plain-language definition.",
    release: "First release",
    overview:
      "The first release is expected to include visitor return, membership conversion, and a longer-term attendance-retention view. These measures describe recorded activity; they do not prove spiritual or overall church growth.",
    example:
      "If someone first visits on 2 March and has another recorded visit on a different date within 30 days, they count as a returning visitor. A second service on 2 March alone does not count as a return.",
    points: [
      "Returning visitor: a later recorded visit on a different date within 30 days of the first visit.",
      "Membership conversion: membership recognized by an administrator within 90 days of the first visit.",
      "Attendance retention: compare a defined group across two periods; the periods still need agreement.",
    ],
    boundary:
      "Attendance alone does not count as membership conversion. Reports should show when there is not enough complete data for a fair comparison.",
  },
  finance: {
    number: "04 / TITHES & WELFARE",
    title: "Keep financial records useful and appropriately private.",
    intro:
      "The first release is expected to support organized recordkeeping for tithes, welfare contributions, and assistance given to members.",
    release: "First release",
    overview:
      "Authorized finance and welfare staff would work with detailed records. Pastors would see summary totals only, protecting person-level financial information.",
    example:
      "An authorized finance officer records contributions and assistance. A pastor reviews period totals without seeing individual contributor or recipient details.",
    points: [
      "Keep tithe and welfare activity as distinct records.",
      "Include welfare contributions and assistance given to members.",
      "Give pastors summary totals only.",
    ],
    boundary:
      "This is finance recordkeeping, not full welfare case management. Transaction details, staff permissions, and approval steps remain to be agreed.",
  },
  discipleship: {
    number: "05 / DISCIPLESHIP",
    title: "Help care teams see where follow-up is needed.",
    intro:
      "A later chapter could help leaders coordinate pastoral follow-up and discipleship support around the same people records.",
    release: "Next chapter",
    overview:
      "This future idea could make care assignments and follow-up easier to coordinate after the first release establishes the administrative foundation.",
    example:
      "A care leader might review who has a follow-up conversation planned, note that it happened, and see where another check-in could help.",
    points: [
      "Explore care assignments and follow-up.",
      "Give ministry leaders a useful view of care coverage.",
      "Shape the workflow with church leaders before implementation.",
    ],
    boundary:
      "Discipleship is not part of the first release and is not implemented. Its details need discovery with the people who would use it.",
  },
  digest: {
    number: "06 / WORD DIGEST",
    title: "A future view of learning and progression.",
    intro:
      "Word Digest is a proposed later feature for organizing class participation and learning journeys.",
    release: "Next chapter",
    overview:
      "A future version could bring class enrollment, class attendance, results, and progression into a clearer shared picture for coordinators and facilitators.",
    example:
      "A coordinator might review a learner’s class attendance and recorded results across a study cycle, then discuss the next step with the appropriate leader.",
    points: [
      "Explore class groups, enrollment, and session attendance.",
      "Keep class attendance separate from Sunday service attendance.",
      "Support recorded learning results and progression.",
    ],
    boundary:
      "Word Digest is a future chapter, not part of the first release and not implemented. Class sequence and progression rules still need confirmation.",
  },
};

const overview = document.querySelector(".overview");
const detailView = document.querySelector("#detail-view");
const detailContent = document.querySelector("#detail-content");
const overviewTitle = document.querySelector("#overview-title");
const backLink = document.querySelector("#back-link");
let originFeature = null;
let overviewScrollY = 0;

function showView(view) {
  overview.hidden = view !== "overview";
  detailView.hidden = view !== "detail";
  document.body.dataset.view = view;
}

function renderFeature(key) {
  if (!Object.hasOwn(features, key)) {
    return false;
  }

  const feature = features[key];

  const future = feature.release === "Next chapter";
  detailContent.innerHTML = `
    <div class="detail-hero">
      <div>
        <p class="eyebrow">${feature.number}</p>
        <h1 id="detail-title" tabindex="-1">${feature.title}</h1>
        <p class="detail-intro">${feature.intro}</p>
      </div>
      <aside class="detail-stamp"><span class="release-tag ${future ? "next" : ""}">${feature.release}</span><p>Proposed direction · Currently in discovery</p></aside>
    </div>
    <div class="detail-columns">
      <div>
        <h2>What this could make easier</h2>
        <p>${feature.overview}</p>
        <div class="example-box"><p class="eyebrow">Everyday example</p><p>${feature.example}</p></div>
        <div class="boundary-note"><strong>A clear boundary</strong><p>${feature.boundary}</p></div>
      </div>
      <section class="capability-section" aria-labelledby="capability-title"><h2 id="capability-title">What could be included</h2><ul class="detail-list">${feature.points.map((point) => `<li>${point}</li>`).join("")}</ul></section>
    </div>`;

  return true;
}

function showCurrentRoute({ moveFocus = true } = {}) {
  const key = window.location.hash.slice(1);

  if (key === "" || key === "overview") {
    showView("overview");

    if (moveFocus) {
      window.scrollTo({ top: overviewScrollY, behavior: "auto" });
      const target = originFeature
        ? document.querySelector(`[data-feature="${originFeature}"]`)
        : overviewTitle;
      target?.focus({ preventScroll: true });
    }

    originFeature = null;
    return;
  }

  if (!renderFeature(key)) {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#overview`,
    );
    showView("overview");
    originFeature = null;
    return;
  }

  showView("detail");

  if (moveFocus) {
    window.scrollTo({ top: 0, behavior: "auto" });
    document.querySelector("#detail-title")?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-feature]").forEach((link) => {
  link.addEventListener("click", () => {
    originFeature = link.dataset.feature;
    overviewScrollY = window.scrollY;
  });
});

document.querySelectorAll("[data-feature-link]").forEach((link) => {
  link.addEventListener("click", () => {
    originFeature = null;
    overviewScrollY = window.scrollY;
  });
});

backLink.addEventListener("click", () => {
  if (originFeature) return;
  originFeature = null;
});

window.addEventListener("hashchange", () => showCurrentRoute());
showCurrentRoute({ moveFocus: false });
