$(function () {
    printError = function(message) {
        $('#chat').append(`
            <tr class="row">
                <td colspa class="col-2"></td>
                <td class="col-10 text-danger">Error: ${message}</td>
            </tr>
        `); 
    }

    handleSpecialCommand = function(message) {
        var splitMessage = message.substr(1).split(' ');
        switch(splitMessage.shift()) {
            case 'setColor':
                var currentUser = $('#message-user').val();
                $('[username=' + currentUser +']').css(
                    "color", splitMessage[0]
                );
                break;
            case 'setBold':
                var currentUser = $('#message-user').val();
                $('[username=' + currentUser +']').css(
                    "font-weight", splitMessage[0]===true?"bold":"normal"
                );
                break;
            case 'setItalic':
                var currentUser = $('#message-user').val();
                $('[username=' + currentUser +']').css(
                    "font-style", splitMessage[0]==="true"?"italic":"normal"
                );
                break;
            case 'setBorder':
                var currentUser = $('#message-user').val();
                $('[username=' + currentUser +']').css(
                    "border-style", splitMessage[0]
                );
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
                handleSpecialCommand(messageBody);
            } catch(error) {
                printError(error);
            } finally {
                return false;
            }
        }
        socket.emit('chat message', $('#message-user').val(), $('#message-field').val());
        $('#message-field').val('');
        return false;
    });

    socket.on('chat message', function(user, msg){
        $('#chat').append(`
            <tr class="row" username="${user}">
                <td class="col-2 text-right"><strong>${user + " said: "}<strong></td>
                <td class="col-10">${msg}</td>
            </tr>
        `); 
    });
    socket.on('user connect event', function(connectEvent){
        $('#chat').append(`
            <tr class="row">
                <td class="col-2 text-right"></td>
                <td class="col-10">A user ${connectEvent}</td>
            </tr>
        `); 
    });
});