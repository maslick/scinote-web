//= require datatables
//= require users/settings/organizations/add_user_modal

var usersDatatable = null;

// Initialize edit name modal window
function initEditName() {
  var editNameModal = $("#organization-name-modal");
  var editNameModalBody = editNameModal.find(".modal-body");
  var editNameModalSubmitBtn = editNameModal.find("[data-action='submit']");
  $(".name-link")
  .on("ajax:success", function(ev, data, status) {
    var nameLink = $(".name-refresh");

    // Set modal body
    editNameModalBody.html(data.html);

    editNameModalBody.find("form")
    .on("ajax:success", function(ev2, data2, status2) {
      // Reload page
      location.reload();
    })
    .on("ajax:error", function(ev2, data2, status2) {
      // Display errors if needed
      editNameModalBody
      .find("form")
      .renderFormErrors("organization", data2.responseJSON);
    });

    // Show modal
    editNameModal.modal("show");
  })
  .on("ajax:error", function(ev, data, status) {
    // TODO
  });

  editNameModalSubmitBtn.on("click", function() {
    // Submit the form inside the modal
    editNameModalBody.find("form").submit();
  });

  editNameModal.on("hidden.bs.modal", function() {
    editNameModalBody.find("form").off("ajax:success ajax:error");
    editNameModalBody.html("");
  });
}

// Initialize edit description modal window
function initEditDescription() {
  var editDescriptionModal = $("#organization-description-modal");
  var editDescriptionModalBody = editDescriptionModal.find(".modal-body");
  var editDescriptionModalSubmitBtn = editDescriptionModal.find("[data-action='submit']");
  $(".description-link")
  .on("ajax:success", function(ev, data, status) {
    var descriptionLink = $(".description-refresh");

    // Set modal body
    editDescriptionModalBody.html(data.html);

    editDescriptionModalBody.find("form")
    .on("ajax:success", function(ev2, data2, status2) {
      // Update module's description in the tab
      descriptionLink.html(data2.description_label);

      // Close modal
      editDescriptionModal.modal("hide");
    })
    .on("ajax:error", function(ev2, data2, status2) {
      // Display errors if needed
      editDescriptionModalBody
      .find("form")
      .renderFormErrors("organization", data2.responseJSON);
    });

    // Show modal
    editDescriptionModal.modal("show");
  })
  .on("ajax:error", function(ev, data, status) {
    // TODO
  });

  editDescriptionModalSubmitBtn.on("click", function() {
    // Submit the form inside the modal
    editDescriptionModalBody.find("form").submit();
  });

  editDescriptionModal.on("hidden.bs.modal", function() {
    editDescriptionModalBody.find("form").off("ajax:success ajax:error");
    editDescriptionModalBody.html("");
  });
}

// Initialize users DataTable
function initUsersTable() {
  usersDatatable = $("#users-table").DataTable({
    order: [[1, "asc"]],
    dom: "RBfltpi",
    stateSave: true,
    buttons: [],
    processing: true,
    serverSide: true,
    ajax: {
      url: $("#users-table").data("source"),
      type: "POST"
    },
    colReorder: {
      fixedColumnsLeft: 1000000 // Disable reordering
    },
    columnDefs: [{
      targets: [ 0, 1, 2 ],
      searchable: true,
      orderable: true
    }, {
      targets: [ 3, 4 ],
      searchable: true,
      orderable: true,
      sWidth: "1%"
    }, {
      targets: 5,
      searchable: false,
      orderable: false,
      sWidth: "1%"
    }],
    columns: [
      { data: "0" },
      { data: "1" },
      { data: "2" },
      { data: "3" },
      { data: "4" },
      { data: "5" }
    ]
  });
}

function initUpdateRoles() {
  // Bind on click event of various "set role" links in user
  // dropdowns.
  $(".users-datatable")
  .on("click", "[data-action='submit-role']", function() {
    var link = $(this);
    var form = link
      .closest(".dropdown-menu")
      .find("form[data-id='update-role-form']");
    var hiddenField = form.find("input[data-field='role']");

    // Update the hidden field of the parent form
    hiddenField.attr("value", link.attr("data-value"));

    // Submit the parent form
    form.submit();
  });

  $(document)
  .on(
    "ajax:success",
    "[data-id='update-role-form']",
    function (e, data, status, xhr) {
      // Reload the whole table
      usersDatatable.ajax.reload();
    }
  )
  .on(
    "ajax:error",
    "[data-id='update-role-form']",
    function (e, data, status, xhr) {
      // TODO
    }
  );
}

function initRemoveUsers() {
  // Bind the "remove user" button in users dropdown
  $(document)
  .on(
    "ajax:success",
    "[data-action='destroy-user-organization']",
    function (e, data, status, xhr) {
      // Populate the modal heading & body
      var modal = $("#destroy-user-organization-modal");
      var modalHeading = modal.find(".modal-header").find(".modal-title");
      var modalBody = modal.find(".modal-body");
      modalHeading.text(data.heading);
      modalBody.html(data.html);

      // Show the modal
      modal.modal("show");
    }
  )
  .on(
    "ajax:error",
    "[data-action='destroy-user-organization']",
    function (e, data, status, xhr) {
      // TODO
    }
  );

  // Also, bind the click action on the modal
  $("#destroy-user-organization-modal")
  .on("click", "[data-action='submit']", function() {
    var btn = $(this);
    var form = btn
      .closest(".modal")
      .find(".modal-body")
      .find("form[data-id='destroy-user-organization-form']");

    // Simply submit the form!
    form.submit();
  });

  // Lastly, bind on the ajax form
  $(document)
  .on(
    "ajax:success",
    "[data-id='destroy-user-organization-form']",
    function (e, data, status, xhr) {
      // Hide modal & clear its contents
      var modal = $("#destroy-user-organization-modal");
      var modalHeading = modal.find(".modal-header").find(".modal-title");
      var modalBody = modal.find(".modal-body");
      modalHeading.text("");
      modalBody.html("");

      // Hide the modal
      modal.modal("hide");

      // Reload the whole table
      usersDatatable.ajax.reload();
    }
  )
  .on(
    "ajax:error",
    "[data-id='destroy-user-organization-form']",
    function (e, data, status, xhr) {
      // TODO
    }
  );
}

initEditName();
initEditDescription();
initUsersTable();
initUpdateRoles();
initRemoveUsers();