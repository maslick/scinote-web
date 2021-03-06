var updatedAtLabel = $("[data-role='updated-at-refresh']");
var nameLabel = $("[data-role='name-refresh']");
var keywordsLabel = $("[data-role='keywords-refresh']");
var authorsLabel = $("[data-role='authors-refresh']");
var descriptionLabel = $("[data-role='description-refresh']");

var editMetadataModal = $("#edit-protocol-metadata-modal");

var keywordsEngine;

function initModalSubmitAndHide() {
  editMetadataModal
  .on("hidden.bs.modal", function() {
    // Destroy keywords input & engine if it exists
    $(this).find(".modal-body [data-role='tagsinput']").tagsinput("destroy");
    if (keywordsEngine) {
      keywordsEngine.clear();
    }

    $(this).find(".modal-title").text("");
    $(this).find(".modal-body").html("");
  });
  editMetadataModal
  .find(".modal-footer [data-action='submit']")
  .on("click", function() {
    editMetadataModal.find(".modal-body form").submit();
  });
}

function initEditName() {
  var link = $("a[data-action='edit-name']");

  link
  .on("ajax:success", function(ev, data, status) {
    var modalBody = editMetadataModal.find(".modal-body");

    // Set modal body & title
    modalBody.html(data.html);
    editMetadataModal
    .find(".modal-title")
    .text(data.title);

    // Bind on form submission
    modalBody.find("form")
    .on("ajax:success", function(ev2, data2, status2) {
      updatedAtLabel.html(data2.updated_at_label);
      nameLabel.html(data2.name_label);

      editMetadataModal.modal("hide");
    })
    .on("ajax:error", function(ev2, data2, status2) {
      // Display errors if needed
      $(this).renderFormErrors("protocol", data2.responseJSON);
    });

    // Show modal
    editMetadataModal.modal("show");
    modalBody.find("input").focus();
  })
  .on("ajax:error", function(ev, data, status) {
    // TODO
  });
}

function initEditKeywords() {
  var link = $("a[data-action='edit-keywords']");

  link
  .on("ajax:success", function(ev, data, status) {
    var modalBody = editMetadataModal.find(".modal-body");

    // Set modal body & title
    modalBody.html(data.html);
    editMetadataModal
    .find(".modal-title")
    .text(data.title);

    var form = modalBody.find("form");
    var input = form.find("[data-role='tagsinput']");

    // Init typeahead Bloodhound engine
    keywordsEngine = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: data.keywords
    });
    keywordsEngine.initialize();

    // Init tagsinput & typeahead
    input.tagsinput({
      maxChars: 50,
      trimValue: true,
      typeaheadjs: {
        highlight: true,
        minLength: 3,
        name: "keywords",
        source: keywordsEngine
      }
    });

    // Bind on form submission
    form
    .on("ajax:success", function(ev2, data2, status2) {
      updatedAtLabel.html(data2.updated_at_label);
      keywordsLabel.html(data2.keywords_label);

      editMetadataModal.modal("hide");
    })
    .on("ajax:error", function(ev2, data2, status2) {
      alert(I18n.t("protocols.header.edit_keywords_modal.update_failed"));
    });

    // Show modal
    editMetadataModal.modal("show");
    input.tagsinput("focus");
  })
  .on("ajax:error", function(ev, data, status) {
    // TODO
  });
}

function initEditAuthors() {
  var link = $("a[data-action='edit-authors']");

  link
  .on("ajax:success", function(ev, data, status) {
    var modalBody = editMetadataModal.find(".modal-body");

    // Set modal body & title
    modalBody.html(data.html);
    editMetadataModal
    .find(".modal-title")
    .text(data.title);

    // Bind on form submission
    modalBody.find("form")
    .on("ajax:success", function(ev2, data2, status2) {
      updatedAtLabel.html(data2.updated_at_label);
      authorsLabel.html(data2.authors_label);

      editMetadataModal.modal("hide");
    })
    .on("ajax:error", function(ev2, data2, status2) {
      // Display errors if needed
      $(this).renderFormErrors("protocol", data2.responseJSON);
    });

    // Show modal
    editMetadataModal.modal("show");
    modalBody.find("textarea").focus();
  })
  .on("ajax:error", function(ev, data, status) {
    // TODO
  });
}

function initEditDescription() {
  var link = $("a[data-action='edit-description']");

  link
  .on("ajax:success", function(ev, data, status) {
    var modalBody = editMetadataModal.find(".modal-body");

    // Set modal body & title
    modalBody.html(data.html);
    editMetadataModal
    .find(".modal-title")
    .text(data.title);

    // Bind on form submission
    modalBody.find("form")
    .on("ajax:success", function(ev2, data2, status2) {
      updatedAtLabel.html(data2.updated_at_label);
      descriptionLabel.html(data2.description_label);

      editMetadataModal.modal("hide");
    })
    .on("ajax:error", function(ev2, data2, status2) {
      // Display errors if needed
      $(this).renderFormErrors("protocol", data2.responseJSON);
    });

    // Show modal
    editMetadataModal.modal("show");
    modalBody.find("textarea").focus();
  })
  .on("ajax:error", function(ev, data, status) {
    // TODO
  });
}

initEditName();
initEditKeywords();
initEditAuthors();
initEditDescription();
initModalSubmitAndHide();