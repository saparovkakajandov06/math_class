 var ajaxFree = true;

function setCookie(name, value) {
    document.cookie = name + "=" + value + ";path=/";
}
function setCookieTime(name, value, days) {
    var date = new Date(); // Берём текущую дату
    date.setTime(date.getTime() + days*86400000);
    document.cookie = name + "=" + value + "; expires=" + date.toGMTString() + ";path=/";
}
function getCookie(name) {
    var r = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
    if (r) return r[2];
    else return "";
}
function deleteCookie(name) {
    var date = new Date(); // Берём текущую дату
    date.setTime(date.getTime() - 1); // Возвращаемся в "прошлое"
    document.cookie = name += "=; expires=" + date.toGMTString() + ";path=/"; // Устанавливаем cookie пустое значение и срок действия до прошедшего уже времени
}

function find(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === value) return true;
    }
    return false;
}
/*
 setCookie("firstname", "Брокер"); // Устанавливаем cookie
 alert(getCookie("firstname")); // Выводим cookie
 deleteCookie("firstname"); // Удаляем cookie
 alert(getCookie("firstname")); // Убеждаемся, что ничего не осталось
 */

function myAlert(str) {
    $("#alertModalMessage").html(str);
    $("#alertModal").modal("show");
}
function myAlertDev(str) {
    $("#devModalMessage").html(str);
    $("#devModal").modal("show");
}
function myConfirm(head, msg) {
    $("#confirmModalHead").html(head);
    $("#confirmModalMessage").html(msg);
    $("#confirmModal").modal("show");
}

function countBasket() {
    let str = getCookie('compare'),
    my_cook = str.split('_');
    if(my_cook[0]=="")
        return 0;
    else
        return my_cook.length;
}

$(document).ready(function () {

    $(".my_cook").on('click', function () {
        let str = getCookie('compare'),
            id = $(this).attr('name'),
        my_cook = str.split('_');
        if (find(my_cook, id)) {
            if($(this).hasClass("guest"))
                $("#my_enter").click();
            else
                window.location = "/lk/collation";
        } else {
            $(this).html('сравнить');
            if (str.length)
                setCookieTime('compare', str + '_' + id, 30);
            else
                setCookieTime('compare', id, 30);

            $("#filter_collation").parent().children(":last").html(countBasket());
        }
        return false;
    });

// меняем надписи кнопок у предложений, добавленных к сравнению
    $('.my_cook').each(function (i, elem) {
        let str = getCookie('compare'),
            id = $(this).attr('name'),
        my_cook = str.split('_');
        if (find(my_cook, id))
            $(this).html('сравнить');
    });

    $("#filter_collation").parent().children(":last").html(countBasket());

    $("#filter_collation").on('click', function () {
        if($(this).hasClass("guest"))
            $("#my_enter").click();
        else {
            let str = getCookie('compare');
            if (str.length)
                window.location = "/lk/collation";
            else
                myAlert("<h3>Сначала выберите сравниваемые предложения</h3>");
        }
        return false;
    });


    if(getCookie('filter_bankWorker_proporsals')) {
        $("#filter_bankWorker_proporsals").html('Показать все предложения');
        $("#filter_bankWorker_proporsals").removeClass('btn-info');
        $("#filter_bankWorker_proporsals").addClass('btn-danger');
    }
    $("#filter_bankWorker_proporsals").on('click', function () {
        if(getCookie('filter_bankWorker_proporsals'))
            deleteCookie('filter_bankWorker_proporsals');
        else
            setCookie('filter_bankWorker_proporsals', '1');
        window.location.reload();
    });

    $(".dev").on("click", function () {
        myAlert("функционал в разработке...");
        return false;
    });

    $(".dev_logout").on("click", function () {
        myAlertDev("функционал в разработке...");
        return false;
    });

    $(".logout").on("click", function () {
        window.location.href = "/logout";
    });
    $(".lk_in").on("click", function () {
        window.location.href = "/lk";
    });

    $(".modal_close").on("click", function () {
        $("#alertModal").modal("hide");
    });

    $(".question").each(function (i,elem) {
        $(this).parent().append("<div class='toolTip hidden'> <div> <div></div> <div>"+$(this).attr("tip")+"</div> </div> </div>");
    });
    $(".question").on("click mouseover", function () {
        if($(this).next().hasClass("toolTip"))
            $(this).next().removeClass("hidden");
    });
    $(".question").on("mouseout", function () {
        if($(this).next().hasClass("toolTip"))
            $(this).next().addClass("hidden");
    });


    // модалка авторизации
    $('.auth_header>span').on('click', function() {
        if($(this).hasClass('active'))
            return false;
        $('.auth_content>div').slideUp();
        $('.auth_content>div[name='+$(this).attr('name')+']').slideDown();

        $('.auth_header>span').removeClass('active');
        $(this).addClass('active');
    });
    $('.auth_content>div>span.forget_pw:first').on('click', function() {
        $('.auth_content>div').slideUp();
        $('.auth_content>div[name=forget]').slideDown();
        $('.auth_header>span').removeClass('active');
    });




});

async function myAjax(method, url, data, myCallback) {
    const csrftoken = getCookie('csrftoken');
    if (data) {
        data['csrfmiddlewaretoken'] = csrftoken;
    } else {
        data = {'csrfmiddlewaretoken': csrftoken}
    }
    $.ajax({
        type: method, //"POST",
        url: url,
        data: data,
        success: function (response) {
            myCallback(null, response);
        },
        error: function (response, statusText, error) {
            myCallback(error, response.responseJSON);
        },
        xhrFields: {
            withCredentials: true
        },
    });
}

