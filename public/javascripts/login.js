$(function () {
    $('form').submit(function(){
        var username = $("#username").val();
        $.post("register", {user: username}, function(data, status){
            $("#username").removeClass("is-invalid");
            let redirectURL = (new URL(location)).searchParams.get('redirect');
            window.location = redirectURL ? redirectURL : "/index.html";
        })
        .fail(function(response) {
            $("#username").addClass("is-invalid");
            $("#username-feedback").html(response.responseText);
        });
        return false;
    });

});