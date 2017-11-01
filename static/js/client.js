$(function () {

    printError = function(message) {
        $('#chat').append(`
            <tr class="row">
                <td class="col text-center text-danger">Error: ${message}</td>
            </tr>
        `); 
        scrollToBottom();
    }

    var style = "";

    handleSpecialCommand = function(socket, message) {
        var splitMessage = message.substr(1).split(' ');
        switch(splitMessage[0]) {
            case 'setColor':
            case 'setBold':
            case 'setItalic':
            case 'setBorder':
                socket.emit(splitMessage[0], $('#message-user').val(), splitMessage[1]);
                break;
            default:
                throw("Illegal command");
        }
    }

    var socket = io();

    $('form').submit(function() {
        var messageBody = $("#message-field").val();
        var username =  $('#message-user').val();
        if(!messageBody) {
            printError('Empty message');
            return false;
        }
        if(messageBody[0] === '/') {
            try{
                handleSpecialCommand(socket, messageBody);
            } catch(error) {
                printError(error);
            } finally {
                $('#message-field').val('');
                return false;
            }
        }
        var appendedMessage = `
            <tr class="row justify-content-end" username="${username}">
                <td class="col-auto font-weight-bold">you said: </td>
                <td class="col-auto">${messageBody}</td>
            </tr>
        `; 
        
        $('#chat').append(appendedMessage);
        scrollToBottom();

        socket.emit('chat message', username, messageBody);
        $('#message-field').val('');
        return false;
    });

    socket.on('chat message', function(user, msg, style){
        var appendedMessage = `
            <tr class="row" username="${user}" style="${style}">
                <td class="col-auto mr-auto font-weight-bold">${user} said: </td>
                <td class="col-10 mr-auto">${msg}</td>
            </tr>
        `; 
        $('#chat').append(appendedMessage);
        scrollToBottom();
    });
    socket.on('apply style', function(rcvStyle){
        var style = rcvStyle;
        var username =  $('#message-user').val();
        $('[username=' + username +']').attr("style",style);
    });
    socket.on('user connect event', function(connectEvent){
        $('#chat').append(`
            <tr class="row">
                <td class="col text-center">A user ${connectEvent}</td>
            </tr>
        `); 
        scrollToBottom();
    });
    socket.on('setColor', function(user, value){
        $('[username=' + user +']').css(
            "color", value
        );      
    });
    socket.on('setBold', function(user, value){
        $('[username=' + user +']').css(
            "font-weight", value
        );      
    });
    socket.on('setItalic', function(user, value){
        $('[username=' + user +']').css(
            "font-style", value
        );      
    });
    socket.on('setBorder', function(user, value){
        $('[username=' + user +']').css(
            "border-style", value
        );      
    });
    scrollToBottom = function() {
        var element = document.getElementById("content");
        element.scrollTop = element.scrollHeight;
    }

    $("#message-field").keypress(function (e) {
        if(e.which == 13 && !e.shiftKey) {        
            $(this).closest("form").submit();
            e.preventDefault();
            return false;
        }
    });
});