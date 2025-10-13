/**
 * 🧩 commonUnifiedList.js
 * --------------------------------------------------------
 * ✅ 모든 페이지 공용 리스트/CRUD/엑셀 기능 통합 스크립트
 * --------------------------------------------------------
 * 제공 기능:
 *   - 검색 + 페이징 + 조회
 *   - 등록 / 수정 / 삭제
 *   - 상세보기 / 모달 관리
 *   - JWT 토큰 자동 인증 (Authorization 헤더 자동 추가)
 *   - CSRF 대응 (Spring Security 지원)
 *   - ✅ 엑셀 다운로드 (한글 파일명/인증/캐시 방지 완전지원)
 *
 * ⚙️ 사용 방법:
 *   initUnifiedList({...설정...})
 *   → 각 페이지에서 필요한 선택자와 API URL만 지정하면 자동 동작
 */

function initUnifiedList(config) {
  // --------------------------------------------------------
  // 🧱 1. 설정값 구조 분해
  // --------------------------------------------------------
  const {
    mode,
    apiUrl,
    tableBodySelector,
    paginationSelector,
    searchInputSelector,
    searchBtnSelector,
    addBtnSelector,
    modalId,
    saveBtnSelector,
    closeBtnSelector,
    checkAllSelector,
    deleteSelectedBtnSelector,
    detailModalId,
    detailFields,
    updateBtnSelector,
    excelBtnSelector,
    columns,
    pageSize = 10,
    groupSize = 10
  } = config;

  // --------------------------------------------------------
  // ⚙️ 공용 변수 및 헬퍼
  // --------------------------------------------------------
  let currentPage = 0;

  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);

  const csrfToken = document.querySelector("meta[name='_csrf']")?.content;
  const csrfHeader = document.querySelector("meta[name='_csrf_header']")?.content;

  const fetchOptions = (method, body) => {
    const opt = { method, headers: { "Content-Type": "application/json" } };
    if (csrfToken && csrfHeader) opt.headers[csrfHeader] = csrfToken;
    if (body) opt.body = JSON.stringify(body);
    const token = localStorage.getItem("token");
    if (token) opt.headers["Authorization"] = "Bearer " + token;
    return opt;
  };

  // --------------------------------------------------------
  // 📋 리스트 조회
  // --------------------------------------------------------
  async function loadList(page = 0) {
    const search = $(searchInputSelector)?.value || "";
    const url = `${apiUrl}?page=${page}&size=${pageSize}&search=${encodeURIComponent(search)}`;

    try {
      const res = await fetch(url, fetchOptions("GET"));
      if (res.status === 401) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("데이터 조회 실패");

      const data = await res.json();

      renderTable(data.content || []);
      renderPagination(data.page, data.totalPages);

      document.dispatchEvent(
        new CustomEvent("totalCountUpdated", { detail: { count: data.totalElements ?? 0 } })
      );
    } catch (err) {
      console.error(err);
      alert("데이터 조회 중 오류가 발생했습니다.");
    }
  }

  // --------------------------------------------------------
  // 🧱 테이블 렌더링
  // --------------------------------------------------------
  function renderTable(list) {
    const tbody = $(tableBodySelector);
    if (!tbody) return;
    tbody.innerHTML = "";

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${columns.length + 1}">데이터가 없습니다.</td></tr>`;
      return;
    }

    list.forEach(row => {
      const tr = document.createElement("tr");

      const chkTd = document.createElement("td");
      chkTd.innerHTML = `<input type="checkbox" value="${row.id}">`;
      tr.appendChild(chkTd);

      columns.forEach(col => {
        const td = document.createElement("td");
        const val = row[col.key] ?? "";
        if (col.isDetailLink) {
          td.innerHTML = `<a href="#" data-id="${row.id}" class="detail-link">${val}</a>`;
        } else td.textContent = val;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    $$(".detail-link").forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        openDetailModal(e.target.dataset.id);
      });
    });
  }

  // --------------------------------------------------------
  // 📄 페이징 렌더링 (수정: groupSize 10 이상 → 두 줄)
  // --------------------------------------------------------
  function renderPagination(page, totalPages) {
    const container = $(paginationSelector);
    if (!container) return;
    container.innerHTML = "";

    if (totalPages <= 0) return;

    const currentGroup = Math.floor(page / groupSize);
    const startPage = currentGroup * groupSize;
    const endPage = Math.min(startPage + groupSize, totalPages);

    const makeBtn = (text, disabled, click) => {
      const btn = document.createElement("button");
      btn.textContent = text;
      btn.disabled = disabled;
      if (!disabled) btn.addEventListener("click", click);
      container.appendChild(btn);
    };

    makeBtn("<<", page === 0, () => loadList(0));
    makeBtn("<", page === 0, () => loadList(page - 1));

    for (let i = startPage; i < endPage; i++) {
      const btn = document.createElement("button");
      btn.textContent = i + 1;
      if (i === page) btn.classList.add("active");
      btn.addEventListener("click", () => loadList(i));
      container.appendChild(btn);
    }

    makeBtn(">", page >= totalPages - 1, () => loadList(page + 1));
    makeBtn(">>", page >= totalPages - 1, () => loadList(totalPages - 1));

    // ✅ groupSize 10 이상 시 flex-wrap: wrap, row-gap 설정
    container.style.flexWrap = groupSize >= 11 ? "wrap" : "nowrap";
    container.style.rowGap = groupSize >= 11 ? "6px" : "0";
  }

  // --------------------------------------------------------
  // 🔍 검색 버튼 클릭
  // --------------------------------------------------------
  $(searchBtnSelector)?.addEventListener("click", () => {
    currentPage = 0;
    loadList(currentPage);
  });

  // --------------------------------------------------------
  // ➕ 등록 / 저장 / 상세 / 수정 / 삭제 / 엑셀
  // --------------------------------------------------------
  $(addBtnSelector)?.addEventListener("click", () => { $(modalId).style.display = "block"; });

  $(saveBtnSelector)?.addEventListener("click", async () => {
    const data = { title: $("#titleInput").value, owner: $("#ownerInput").value };
    const res = await fetch(apiUrl, fetchOptions("POST", data));
    const result = await res.json();
    alert(result.status === "success" ? "등록 완료" : "등록 실패");
    $(modalId).style.display = "none";
    loadList();
  });

  async function openDetailModal(id) {
    try {
      const res = await fetch(`${apiUrl}/${id}`, fetchOptions("GET"));
      if (!res.ok) throw new Error("상세 조회 실패");
      const item = await res.json();
      if (!item) return alert("데이터를 찾을 수 없습니다.");
      $(detailFields.id).value = item.id;
      $(detailFields.title).value = item.title;
      $(detailFields.owner).value = item.owner;
      $(detailFields.regDate).value = item.regDate;
      $(detailModalId).style.display = "block";
    } catch (err) {
      console.error(err);
      alert("상세 조회 중 오류가 발생했습니다.");
    }
  }

  $(updateBtnSelector)?.addEventListener("click", async () => {
    const id = $(detailFields.id).value;
    const data = { title: $(detailFields.title).value, owner: $(detailFields.owner).value };
    const res = await fetch(`${apiUrl}/${id}`, fetchOptions("PUT", data));
    const result = await res.json();
    alert(result.status === "updated" ? "수정 완료" : "수정 실패");
    $(detailModalId).style.display = "none";
    loadList(currentPage);
  });

  $(deleteSelectedBtnSelector)?.addEventListener("click", async () => {
    const checked = Array.from(document.querySelectorAll(`${tableBodySelector} input[type='checkbox']:checked`)).map(chk => parseInt(chk.value));
    if (checked.length === 0) return alert("삭제할 항목을 선택하세요.");
    if (!confirm(`${checked.length}건을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(apiUrl, fetchOptions("DELETE", checked));
      const result = await res.json();
      alert(result.message || "삭제 완료");
      loadList(currentPage);
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  });

  $(excelBtnSelector)?.addEventListener("click", async () => {
    try {
      const search = $(searchInputSelector)?.value || "";
      const timestamp = new Date().getTime();
      const url = `${apiUrl}/excel?search=${encodeURIComponent(search)}&t=${timestamp}`;
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: "Bearer " + token } : {};
      const res = await fetch(url, { method: "GET", headers });
      if (res.status === 401) { alert("세션이 만료되었습니다."); localStorage.clear(); window.location.href = "/login"; return; }
      if (!res.ok) throw new Error("엑셀 다운로드 실패");
      const disposition = res.headers.get("Content-Disposition");
      let filename = "리스트.xlsx";
      if (disposition) {
        const utf8 = disposition.match(/filename\*=UTF-8''(.+)/);
        const ascii = disposition.match(/filename="(.+)"/);
        if (utf8) filename = decodeURIComponent(utf8[1]);
        else if (ascii) filename = ascii[1];
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("❌ Excel Download Error:", err);
      alert("엑셀 다운로드 중 오류가 발생했습니다.");
    }
  });

  // --------------------------------------------------------
  // ✅ 전체 선택 / 해제
  // --------------------------------------------------------
  const checkAllEl = document.querySelector(checkAllSelector);
  if (checkAllEl) {
    checkAllEl.addEventListener("change", e => {
      const checked = e.target.checked;
      document.querySelectorAll(`${tableBodySelector} input[type='checkbox']`).forEach(chk => (chk.checked = checked));
    });
  }

  document.addEventListener("change", e => {
    if (e.target.matches(`${tableBodySelector} input[type='checkbox']`)) {
      const all = document.querySelectorAll(`${tableBodySelector} input[type='checkbox']`);
      const checked = document.querySelectorAll(`${tableBodySelector} input[type='checkbox']:checked`);
      const checkAll = document.querySelector(checkAllSelector);
      if (checkAll) checkAll.checked = all.length === checked.length;
    }
  });

  // --------------------------------------------------------
  // ❎ 모달 닫기 버튼
  // --------------------------------------------------------
  $$(closeBtnSelector).forEach(btn => {
    btn.addEventListener("click", e => {
      const targetId = e.target.dataset.close;
      if (targetId) $(`#${targetId}`).style.display = "none";
    });
  });

  // --------------------------------------------------------
  // 🚀 초기 로드
  // --------------------------------------------------------
  loadList();
}
