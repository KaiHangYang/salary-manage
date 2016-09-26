function profession_init() {
	$.ajax({
		url:"/pro",
		type: "POST",
		success: function(data) {
			$("#pro_tbody").empty();
			for (i in data) {
				$("#pro_tbody").append('<tr p_id="'+data[i].id+'">\
					<td class="td_name">'+data[i].name+'</td>\
                    <td class="td_level">'+data[i].level+'</td>\
                    <td class="td_salary">'+data[i].salary+'</td>\
                    <td p_id="'+data[i].id+'">\
                        <button type="button" class="btn btn-primary table_button pro_chg">更改</button>\
                        <button type="button" class="btn btn-danger table_button pro_del" >删除</button>\
                    </td></tr>'
				);
			}
		}
	});
}
function profession_delete(id, dom) {
	$.ajax({
		url: "/pro",
		type: "DELETE",
		data: {id: id},
		success: function(data) {
			if (data.result) {
				$("#ask_dialog").modal("hide");
				send_msg(data.msg);
				dom.remove();
			}
			else {
				$("#ask_dialog").modal("hide");
				send_msg(data.msg);
			}
		}
	})
}
function profession_update(dom, id, name, level, salary, is_add) {
	if ((!is_add && id < 0)|| name == "" || level < 1 || level > 5) {
		send_msg("提交数据非空或不合法!");
		$("#profession_dialog").modal("hide");
		return;
	}
	var action = "update";
	if (is_add) {
		action = "add";
	}
	$.ajax({
		url: "/pro",
		type: "PUT",
		data: {action: action, id: id, name: name, level: level, salary: salary},
		success: function(data) {
			$("#profession_dialog").modal("hide");
			if (data.result) {
				if (is_add) {
					$("#pro_tbody").append('<tr p_id="'+id+'">\
						<td class="td_name">'+name+'</td>\
	                    <td class="td_level">'+level+'</td>\
	                    <td class="td_salary">'+salary+'</td>\
	                    <td p_id="'+id+'">\
	                        <button type="button" class="btn btn-primary table_button pro_chg">更改</button>\
	                        <button type="button" class="btn btn-danger table_button pro_del" >删除</button>\
	                    </td></tr>'
					);
				}
				else {
					dom.children(".td_name").text(name);
					dom.children(".td_level").text(level);
					dom.children(".td_salary").text(salary);
				}
			
				send_msg(data.msg);
			}
			else {
				send_msg(data.msg);
			}
		}
	});
}
function send_msg(msg) {
	$("#msg_dialog .modal-body").text(msg);
	$("#msg_dialog").modal("show");
}

function init() {
	console.log("init");
	profession_init();
	$("#pro_tbody").bind("click", function(e) {
		e.stopPropagation();
		var dom = $(e.target).parent().parent("tr")
		var p_id =  parseInt(dom.attr("p_id"));

		if ($(e.target).hasClass("pro_chg")) {
			$("#profession_dialog #profession_name").val(dom.children(".td_name").text());
			$("#profession_dialog #profession_level").val(parseInt(dom.children(".td_level").text()));
			$("#profession_dialog #profession_salary").val(parseInt(dom.children(".td_salary").text()));
			$("#profession_dialog").modal("show");

			$("#profession_dialog .pro_save").bind("click", function() {
				profession_update(dom, p_id, $("#profession_dialog #profession_name").val(), $("#profession_dialog #profession_level").val(), $("#profession_dialog #profession_salary").val(), false);
				$("#profession_dialog .pro_save").unbind("click");
			});
		}
		else if ($(e.target).hasClass("pro_del")) {
			$("#ask_dialog .ask_sure").bind("click", function(event) {
				profession_delete(p_id, dom);
				$("#ask_dialog .ask_sure").unbind("click");
			});

			$("#ask_dialog").modal("show");
		}

	});
	$("#profession_add").bind("click", function(e){
		e.stopPropagation();
		$("#profession_dialog #profession_name").val("");
		$("#profession_dialog #profession_level").val(1);
		$("#profession_dialog #profession_salary").val(0);
		$("#profession_dialog").modal("show");

		$("#profession_dialog .pro_save").bind("click", function() {
			profession_update(null, -1, $("#profession_dialog #profession_name").val(), $("#profession_dialog #profession_level").val(), $("#profession_dialog #profession_salary").val(), true);
			$("#profession_dialog .pro_save").unbind("click");
		})
	});
}

window.onload = init;