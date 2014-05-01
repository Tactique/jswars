$(document).ready(function() {
    ajaxNetwork = new AjaxNetwork();

    $("#login").submit(function(e) {
        e.preventDefault();
        var form = $(e.target);
        ajaxNetwork.sendLogin(form);
    });

    $("#register").submit(function(e) {
        e.preventDefault();
        var form = $(e.target);
        ajaxNetwork.sendRegister(form);
    });
});
