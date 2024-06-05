document.addEventListener("DOMContentLoaded", () => {
  const bookForm = document.getElementById("book-form");
  const unfinishedList = document.getElementById("unfinished-list");
  const finishedList = document.getElementById("finished-list");
  const finishedBook = document.getElementById("finished-bookshelf");
  const unFinishedBook = document.getElementById("unfinished-bookshelf");
  const searchInput = document.getElementById("search");
  const bookInfo = document.getElementById("book-info");
  const confirmDelete = document.getElementById("confirm-delete");
  const modalDelete = document.getElementById("modal_delete");
  const modalEdit = document.getElementById("modal_edit");
  const editTitle = document.getElementById("edit-title");
  const editAuthor = document.getElementById("edit-author");
  const editYear = document.getElementById("edit-year");
  const confirmEdit = document.getElementById("confirm-edit");

  let currentBookItem = null;
  let currentSkeleton = null;

  bookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  searchInput.addEventListener("input", function (event) {
    searchBooks(event.target.value.trim());
  });

  function addBook() {
    const id = Date.now();
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const year = document.getElementById("year").value;
    const isFinished = document.getElementById("is-finish").checked;
    const book = createBookElement(id, title, author, year, isFinished);
    if (isFinished) {
      finishedList.appendChild(book);
    } else {
      unfinishedList.appendChild(book);
    }
    saveData();
  }

  function createBookElement(id, title, author, year, isComplete) {
    const bookItem = document.createElement("li");
    bookItem.draggable = "true";
    bookItem.className =
      "mb-4 p-4 bg-gray-100 border-1 rounded shadow-md drag glass";
    bookItem.dataset.id = id;
    bookItem.innerHTML = `   
            <h3 class="text-xl font-bold">${title}</h3>
            <p class="text-gray-600">${author}</p>
            <p class="text-gray-600">${year}</p>
            <button class="tgl btn btn-outline btn-accent">${
              isComplete ? "Belum Selesai" : "Selesai"
            }</button>
            <button class="delete-modal btn btn-outline btn-error">Hapus</button>
            <button class="edit btn btn-outline btn-success">Edit</button>
        `;

    bookItem.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", e.target.dataset.id);
    });

    bookItem.querySelector(".tgl").addEventListener("click", function () {
      toggleBookStatus(bookItem);
    });

    bookItem
      .querySelector(".delete-modal")
      .addEventListener("click", function () {
        currentBookItem = bookItem;
        bookInfo.textContent = ` ${title}`;
        modalDelete.showModal();
      });

    bookItem.querySelector(".edit").addEventListener("click", function () {
      currentBookItem = bookItem;
      editTitle.value = title;
      editAuthor.value = author;
      editYear.value = year;
      modalEdit.showModal();
    });

    return bookItem;
  }

  finishedBook.addEventListener("dragover", (event) => {
    event.preventDefault();
    handleDragOver(event, finishedBook, finishedList, "finish");
  });

  finishedBook.addEventListener("drop", (e) => {
    e.preventDefault();
    handleDrop(e, finishedList, "Belum Selesai", "btn-accent", "btn-primary");
  });

  unFinishedBook.addEventListener("dragover", (event) => {
    event.preventDefault();
    handleDragOver(event, unFinishedBook, unfinishedList, "unfinish");
  });

  unFinishedBook.addEventListener("drop", (e) => {
    e.preventDefault();
    handleDrop(e, unfinishedList, "Selesai", "btn-primary", "btn-accent");
  });

  function handleDragOver(event, bookshelf, targetList, skeletonClass) {
    const skeleton = createOrUpdateSkeleton(event, targetList, skeletonClass);

    const children = Array.from(targetList.children);
    let insertBeforeElement = null;

    for (const child of children) {
      const rect = child.getBoundingClientRect();
      const offsetY = event.clientY - rect.top;
      if (offsetY < rect.height / 2) {
        insertBeforeElement = child;
        break;
      }
    }

    if (insertBeforeElement) {
      targetList.insertBefore(skeleton, insertBeforeElement);
    } else {
      targetList.appendChild(skeleton);
    }
  }

  function createOrUpdateSkeleton(event, targetList, skeletonClass) {
    if (currentSkeleton && currentSkeleton.parentElement !== targetList) {
      currentSkeleton.remove();
      currentSkeleton = null;
    }

    if (!currentSkeleton) {
      currentSkeleton = document.createElement("div");
      currentSkeleton.className = `w-full h-24 skeleton ${skeletonClass}`;
      currentSkeleton.style.pointerEvents = "none";
    }

    return currentSkeleton;
  }

  function handleDrop(event, targetList, buttonText, removeClass, addClass) {
    if (currentSkeleton) {
      currentSkeleton.remove();
      currentSkeleton = null;
    }

    const id = event.dataTransfer.getData("text/plain");
    const draggableElement = document.querySelector(`[data-id="${id}"]`);

    const children = Array.from(targetList.children);
    let insertBeforeElement = null;

    for (const child of children) {
      const rect = child.getBoundingClientRect();
      const offsetY = event.clientY - rect.top;
      if (offsetY < rect.height / 2) {
        insertBeforeElement = child;
        break;
      }
    }

    if (insertBeforeElement) {
      targetList.insertBefore(draggableElement, insertBeforeElement);
    } else {
      targetList.appendChild(draggableElement);
    }

    draggableElement.querySelector(".tgl").innerText = buttonText;
    draggableElement
      .querySelector(".tgl")
      .classList.replace(removeClass, addClass);

    anime({
      targets: draggableElement,
      scale: [1.1, 1],
      duration: 500,
      easing: "easeInOutQuad",
    });

    saveData();
  }

  function toggleBookStatus(bookItem) {
    const isComplete = bookItem.querySelector(".tgl").innerText === "Selesai";
    if (isComplete) {
      finishedList.appendChild(bookItem);
      bookItem.querySelector(".tgl").innerText = "Belum Selesai";
      bookItem
        .querySelector(".tgl")
        .classList.replace("btn-accent", "btn-primary");
    } else {
      unfinishedList.appendChild(bookItem);
      bookItem.querySelector(".tgl").innerText = "Selesai";
      bookItem
        .querySelector(".tgl")
        .classList.replace("btn-primary", "btn-accent");
    }
    saveData();
  }

  confirmDelete.addEventListener("click", () => {
    if (currentBookItem) {
      deleteBook(currentBookItem);
      modalDelete.close();
    }
  });

  function deleteBook(bookItem) {
    bookItem.remove();
    saveData();
  }

  confirmEdit.addEventListener("click", () => {
    if (currentBookItem) {
      currentBookItem.querySelector("h3").innerText = editTitle.value;
      currentBookItem.querySelector("p:nth-child(2)").innerText =
        editAuthor.value;
      currentBookItem.querySelector("p:nth-child(3)").innerText =
        editYear.value;
      saveData();
      modalEdit.close();
    }
  });

  function saveData() {
    const unfinishedBooks = [];
    const finishedBooks = [];

    unfinishedList.querySelectorAll("li").forEach((bookItem) => {
      unfinishedBooks.push({
        id: bookItem.dataset.id,
        title: bookItem.querySelector("h3").innerText,
        author: bookItem.querySelector("p:nth-child(2)").innerText,
        year: Number(bookItem.querySelector("p:nth-child(3)").innerText),
        isComplete: false,
      });
    });

    finishedList.querySelectorAll("li").forEach((bookItem) => {
      finishedBooks.push({
        id: bookItem.dataset.id,
        title: bookItem.querySelector("h3").innerText,
        author: bookItem.querySelector("p:nth-child(2)").innerText,
        year: Number(bookItem.querySelector("p:nth-child(3)").innerText),
        isComplete: true,
      });
    });

    localStorage.setItem("unfinishedBooks", JSON.stringify(unfinishedBooks));
    localStorage.setItem("finishedBooks", JSON.stringify(finishedBooks));
  }

  function loadData() {
    const unfinishedBooks =
      JSON.parse(localStorage.getItem("unfinishedBooks")) || [];
    const finishedBooks =
      JSON.parse(localStorage.getItem("finishedBooks")) || [];

    unfinishedBooks.forEach((book) => {
      const bookItem = createBookElement(
        book.id,
        book.title,
        book.author,
        book.year,
        book.isComplete
      );
      unfinishedList.appendChild(bookItem);
    });

    finishedBooks.forEach((book) => {
      const bookItem = createBookElement(
        book.id,
        book.title,
        book.author,
        book.year,
        book.isComplete
      );
      finishedList.appendChild(bookItem);
    });
  }

  function searchBooks(query) {
    const allBooks = Array.from(
      unfinishedList.querySelectorAll("li"),
      (el) => el
    ).concat(Array.from(finishedList.querySelectorAll("li"), (el) => el));

    allBooks.forEach((book) => {
      const title = book.querySelector("h3").innerText.toLowerCase();
      const isVisible = title.includes(query);
      book.style.display = isVisible ? "block" : "none";
    });
  }

  loadData();
});
