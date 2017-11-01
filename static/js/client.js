$(function () {
    printError = function(message) {
        $('#chat').append(`
            <tr class="row">
                <td colspa class="col-2"></td>
                <td class="col-10 text-danger">Error: ${message}</td>
            </tr>
        `); 
    }

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
        if(!messageBody) {
            printError('Empty message');
            return;
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
        socket.emit('chat message', $('#message-user').val(), $('#message-field').val());
        $('#message-field').val('');
        return false;
    });

    socket.on('chat message', function(user, msg, style){
        var appendedMessage = `
            <tr class="row" username="${user}" style="${style}">
                <td class="col-2 text-right"><strong>${user + " said: "}<strong></td>
                <td class="col-10">${msg}</td>
            </tr>
        `; 
        $('#chat').append(appendedMessage);
    });
    socket.on('user connect event', function(connectEvent){
        $('#chat').append(`
            <tr class="row">
                <td class="col-2 text-right"></td>
                <td class="col-10">A user ${connectEvent}</td>
            </tr>
        `); 
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
});