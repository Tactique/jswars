$(document).ready(function() {
    ajaxNetwork = new AjaxNetwork();

    $("#login").submit(function(e) {
        e.preventDefault();
        var username = $("#username").val();
        var password = $("#password").val();
        var loginInfo = {username: username,
                         password: password};

        ajaxNetwork.sendLogin(loginInfo);
    });
});
