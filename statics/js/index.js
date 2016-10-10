var staff_profession;
var gender_text = {
	"0": "男",
	"1": "女"
}
var gender_text_b = {
	"男": 0,
	"女": 1
}

function profession_init() {
	$.ajax({
		url:"/pro",
		type: "POST",
		success: function(data) {
			$("#pro_tbody").empty();
			for (i in data) {
				$("#pro_tbody").append('<tr p_id="'+data[i].id+'">\
					<td class="td_name">'+data[i].name+' ('+data[i].id+')</td>\
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
function overtime_init() {
	$.ajax({
		url:"/overtime",
		type: "POST",
		success: function(data) {
			$("#overtime_tbody").empty();
			for (i in data) {
				$("#overtime_tbody").append('<tr p_id="'+data[i].id+'">\
					<td class="td_name">'+data[i].name+' ('+data[i].id+')</td>\
                    <td class="td_salary">'+data[i].salary+'</td>\
                    <td p_id="'+data[i].id+'">\
                        <button type="button" class="btn btn-primary table_button overtime_chg">更改</button>\
                        <button type="button" class="btn btn-danger table_button overtime_del" >删除</button>\
                    </td></tr>'
				);
			}
		}
	});
}
function staff_pro_init() {
	$.ajax({
		url: "/pro",
		type: "POST",
		success: function(data) {
			staff_profession = data;
		}
	});
}
function staff_init() {
	$.ajax({
		url:"/staff",
		type: "POST",
		success: function(data) {
			data = data.staff;
			$("#staff_tbody").empty();
			for (i in data) {
				$("#staff_tbody").append('<tr p_id="'+data[i].id+'">\
					<td class="td_name">'+data[i].name+' ('+data[i].id+')</td>\
                    <td class="td_gender">'+gender_text[data[i].gender+""]+'</td>\
                    <td class="td_profession" pro_id="'+data[i].profession_id+'">'+staff_profession[data[i].profession_id].name+'</td>\
                    <td p_id="'+data[i].id+'">\
                        <button type="button" class="btn btn-primary table_button staff_chg">更改</button>\
                        <button type="button" class="btn btn-danger table_button staff_del" >删除</button>\
                    </td></tr>'
				);
			}
			staff_dialog_init();
		}
	});
}
function staff_dialog_init() {
	$("#staff_pro").empty();
	$("#staff_pro").append("<option value='-1'>请选择</option>");
	
	for (i in staff_profession) {
		$("#staff_pro").append("<option value='"+staff_profession[i].id+"'>"+staff_profession[i].name+"</option>");
	}
	$("#staff_pro").val(-1);
}
function allowance_init(type, in_data) {
	/*
	*	0表示 全部
	* 	1表示 只有名字
	*	2表示 只有日期
	* 	3表示 名字日期都有
	*/
	var data;

	if (type == 3 || type == 1) {
		in_data.name = parseInt(in_data.name);
		if (isNaN(in_data.name)) {
			send_msg("员工ID请输入数字!");
			return;
		}
	}

	if (type == 3) {
		data = {
			action: "onm",
			staff_id: in_data.name,
			m_month: in_data.m_month
		}
	}
	else if (type == 1){
		data = {
			action: "oname",
			staff_id: in_data.name
		}
	}
	else if (type == 2) {
		data = {
			action: "omonth",
			m_month: in_data.m_month
		}
	}
	else {
		data = {
			action: "all"
		}
	}
	$.ajax({
		url: "/allowance",
		type: "POST",
		data: data,
		success: function (data) {
			$("#allowance_tbody").empty();
			data = data.data;
			var i;
			for (i in data) {
				$("#allowance_tbody").append('\
					<tr>\
					    <td class="td_al_month">'+data[i].m_month+'</td>\
					    <td class="td_al_name" s_id="'+data[i].staff_id+'">'+data[i].staff_name+'  ('+data[i].staff_id+')</td>\
					    <td class="td_al_o_name" o_id="'+data[i].overtime_id+'">'+data[i].overtime_name+'</td>\
					    <td class="td_al_time">'+data[i].m_time+'</td>\
					    <td>\
					        <button type="button" class="btn btn-primary table_button al_chg">更改</button>\
					        <button type="button" class="btn btn-danger table_button al_del">删除</button>\
					    </td>\
					</tr>\
				');
			}
		}
	});
}
function allowance_dialog_init() {
	$.ajax({
		url: "/overtime",
		type: "POST",
		success: function(data) {
			$("#allowance_o_type").empty();
			$("#allowance_o_type").append("<option value='-1'>请选择</option>");
			var i;
			for (i in data) {
				$("#allowance_o_type").append("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
			}
		}
	})
}
function allowance_delete(dom, m_month, staff_id, overtime_id) {
	$.ajax({
		url: "/allowance",
		type: "DELETE",
		data: {"m_month":m_month, "staff_id": staff_id, overtime_id: overtime_id},
		success: function (data) {
			$("#ask_dialog").modal("hide");
			if (data.result) {
				dom.remove();
			}
			send_msg(data.msg);
		}
	});
}
function allowance_update(dom, in_data, is_add) {
	if (isNaN(in_data.staff_id) || in_data.staff_id < 0 || isNaN(in_data.overtime_id) || in_data.overtime_id < 0 || isNaN(in_data.m_time) || in_data.m_time < 0) {
		send_msg("提交数据非空或不合法!");
		$("#allowance_dialog").modal("hide");
		return;
	}
	var action;
	if (is_add) {
		action = "add";
	}
	else {
		action = "update";
	}

	$.ajax({
		url: "/allowance",
		type: "PUT",
		data: {action: action, m_month: in_data.m_month, staff_id: in_data.staff_id, m_time: in_data.m_time, overtime_id: in_data.overtime_id},
		success: function(data) {
			$("#allowance_dialog").modal("hide");
			if (data.result) {
				if (is_add) {
					allowance_init(0, null);
				}
				else {
					dom.children(".td_al_time").text(in_data.m_time);
				}
			}
			send_msg(data.msg);
		}
	});
}
function attendance_init(type, in_data) {
	/*
	*	0表示 全部
	* 	1表示 只有名字
	*	2表示 只有日期
	* 	3表示 名字日期都有
	*/
	var data;
	if (type == 3 || type == 1) {
		in_data.name = parseInt(in_data.name);
		if (isNaN(in_data.name)) {
			send_msg("用户ID请输入数字!");
			return;
		}
	}

	if (type == 3) {
		data = {
			action: "onm",
			staff_id: in_data.name,
			m_month: in_data.m_month
		}
	}
	else if (type == 1){
		data = {
			action: "oname",
			staff_id: in_data.name
		}
	}
	else if (type == 2) {
		data = {
			action: "omonth",
			m_month: in_data.m_month
		}
	}
	else {
		data = {
			action: "all"
		}
	}
	$.ajax({
		url: "/attendance",
		type: "POST",
		data: data,
		success: function (data) {
			$("#attendance_tbody").empty();
			var i;
			for (i in data) {
				$("#attendance_tbody").append('\
					<tr>\
					    <td class="td_at_month">'+data[i].m_month+'</td>\
					    <td class="td_at_name" s_id="'+data[i].staff_id+'">'+data[i].staff_name+'  ('+data[i].staff_id+')</td>\
					    <td class="td_at_leave">'+data[i].leave_time+'</td>\
					    <td class="td_at_late">'+data[i].late_time+'</td>\
					    <td class="td_at_absent">'+data[i].absent_time+'</td>\
					    <td>\
					        <button type="button" class="btn btn-primary table_button at_chg">更改</button>\
					        <button type="button" class="btn btn-danger table_button at_del">删除</button>\
					    </td>\
					</tr>\
				');
			}
		}
	});
}

function salary_init(type, in_data, method, is_dialog) {
	/*
	* 	type
	*	0表示 全部
	* 	1表示 只有名字
	*	2表示 只有日期
	* 	3表示 名字日期都有
	*/

	/*
	* 	method
	*	0表示 显示
	* 	1表示 更新
	*/
	var data;
	if (method == 0) {
		if (type == 4) {
			// 表示通过部门来获取
			data = {
				action2: "op",
				profession_id: in_data.profession_id
			}
		}
		else if (type == 3) {
			data = {
				action2: "onm",
				staff_id: in_data.staff_id,
				m_month: in_data.m_month
			}
		}
		else if (type == 1){
			data = {
				action2: "oname",
				staff_id: in_data.staff_id
			}
		}
		else if (type == 2) {
			data = {
				action2: "omonth",
				m_month: in_data.m_month
			}
		}
		else {
			data = {
				action2: "all"
			}
		}
		data["action"] = "get";
	}
	else if (method == 1) {
		if (type == 0) {
			data = {
				action2: "one",
				staff_id: in_data.staff_id,
				m_month: in_data.m_month
			}
		}
		else {
			data = {
				action2: "all",
				m_month: in_data.m_month
			}
		}
		data["action"] = "update";
	}
	
	$.ajax({
		url: "/salary",
		type: "POST",
		data: data,
		success: function (data) {
			var i;
			if (data.result) {
				$("#salary_tbody").empty();
				for (i in data) {
					if (i == "result" || i == "msg") {
						continue;
					}

					$("#salary_tbody").append('\
						<tr>\
						    <td class="td_sa_month">'+data[i].m_month+'</td>\
						    <td class="td_sa_pro">'+staff_profession[data[i].profession_id].name+' ('+data[i].profession_id+')</td>\
						    <td class="td_sa_name" s_id="'+data[i].staff_id+'">'+data[i].name+'  ('+data[i].staff_id+')</td>\
						    <td class="td_sa_salary">'+data[i].salary+'</td>\
						</tr>\
					');
				}
			}
			if (is_dialog) {
				send_msg(data.msg);
			}
			
		}
	});
}

function attendance_delete(dom, m_month, staff_id) {
	$.ajax({
		url: "/attendance",
		type: "DELETE",
		data: {"m_month":m_month, "staff_id": staff_id},
		success: function (data) {
			$("#ask_dialog").modal("hide");
			if (data.result) {
				dom.remove();
			}
			send_msg(data.msg);
		}
	});
}
function attendance_update(dom, in_data, is_add) {
	if (isNaN(in_data.staff_id) || in_data.staff_id < 0 || isNaN(in_data.leave_time) || in_data.leave_time < 0 || isNaN(in_data.late_time) || in_data.late_time < 0 || isNaN(in_data.absent_time) || in_data.absent_time < 0) {
		send_msg("提交数据非空或不合法!");
		$("#attendance_dialog").modal("hide");
		return;
	}
	var action;
	if (is_add) {
		action = "add";
	}
	else {
		action = "update";
	}

	$.ajax({
		url: "/attendance",
		type: "PUT",
		data: {action: action, m_month: in_data.m_month, staff_id: in_data.staff_id, leave_time: in_data.leave_time, late_time: in_data.late_time, absent_time: in_data.absent_time},
		success: function(data) {
			$("#attendance_dialog").modal("hide");
			if (data.result) {
				if (is_add) {
					attendance_init(0, null);
				}
				else {
					dom.children(".td_at_leave").text(in_data.leave_time);
					dom.children(".td_at_late").text(in_data.late_time);
					dom.children(".td_at_absent").text(in_data.absent_time);
				}
			}
			send_msg(data.msg);
		}
	});
}

function profession_delete(id, dom) {
	$.ajax({
		url: "/pro",
		type: "DELETE",
		data: {id: id},
		success: function(data) {
			$("#ask_dialog").modal("hide");
			if (data.result) {
				dom.remove();
			}
			send_msg(data.msg);
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
				if (!is_add) {
					dom.children(".td_name").text(name + " ("+id+")");
					dom.children(".td_level").text(level);
					dom.children(".td_salary").text(salary);
				}
			}
			send_msg(data.msg);
		}
	});
}
function overtime_delete(dom, id) {
	$.ajax({
		url: "/overtime",
		type: "DELETE",
		data: {id: id},
		success: function(data) {
			$("#ask_dialog").modal("hide");
			if (data.result) {
				dom.remove();
			}
			send_msg(data.msg);
			allowance_dialog_init();
		}
	})
}

function overtime_update(dom, id, name, salary, is_add) {
	if (name == "" || (!is_add && id < 0)) {
		$("#overtime_dialog").modal("hide");
		send_msg("填充数据为空或不合法!");
		return;
	}
	var action = "update";
	if (is_add) {
		action = "add";
	}
	$.ajax({
		url: "/overtime",
		type: "PUT",
		data: {action: action, id: id, name: name, salary: salary},
		success: function(data) {
			$("#overtime_dialog").modal("hide");
			if (data.result) {
				if (!is_add) {
					dom.children(".td_name").text(name + " ("+id+")");
					dom.children(".td_salary").text(salary);
				}
			}
			send_msg(data.msg);
			allowance_dialog_init();
		}
	});
}
function staff_delete(dom, id) {
	$.ajax({
		url: "/staff",
		type: "DELETE",
		data: {id: id},
		success: function (data) {
			$("#ask_dialog").modal("hide");
			if (data.result) {
				dom.remove();
			}
			send_msg(data.msg);
		}
	});
}
function staff_update(dom, id, name, gender, pro, is_add) {
	if (name == "" || (!is_add && id < 0) || pro == -1) {
		$("#staff_dialog").modal("hide");
		send_msg("填充数据不合法!");
		return;
	}
	var action = "update";
	if (is_add) {
		action = "add";
	}
	$.ajax({
		url: "/staff",
		type: "PUT",
		data: {id: id, name: name, gender: gender, profession_id: pro, action: action},
		success: function(data) {
			$("#staff_dialog").modal("hide");
			if (data.result) {
				
				if (!is_add) {
					dom.children(".td_name").text(name + " ("+id+")");
					dom.children(".td_gender").text(gender_text[gender]);
					dom.children(".td_profession").text(staff_profession[pro].name);
					dom.children(".td_profession").attr({"pro_id": pro});
				}
			}
			send_msg(data.msg);
		}
	})
}

function bonus_init(type, s_id) {
	var in_data;
	s_id = parseInt(s_id);
	if (type == 1 && isNaN(s_id)) {
		send_msg("请输入数字!");
		return;
	}
	if (type == 0) {
		in_data = {
			action: "all"
		};
	}
	else {
		in_data = {
			staff_id: s_id,
			action: "one"
		}
	}
	$.ajax({
		url: "/bonus",
		type: "POST",
		data: in_data,
		success: function(data) {
			var i;
			$("#bonus_tbody").empty();
			for (i in data) {
				$("#bonus_tbody").append("\
					<tr>\
                        <td>"+data[i].name+" ("+data[i].staff_id+")</td>\
                        <td>"+data[i].bonus+"</td>\
                    </tr>\
				");
			}
		}
	})
	
}
// 数据下载相关的函数
function table_download(name) {
	if (name == "") {
		name = "工资表";
	}
	export_table_to_excel("salary_table", name);
}
function send_msg(msg) {
	$("#msg_dialog .modal-body").text(msg);
	$("#msg_dialog").modal("show");
}

function init() {
	staff_pro_init();
	profession_init();
	overtime_init();
	staff_init();
	allowance_init(0, null);
	attendance_init(0 ,null);
	salary_init(0, null, 0, 0);
	bonus_init(0, "");

	$("#nav-bar").bind("click", function(e){
		if ($(e.target).hasClass("nav-pro")){
			console.log("pro_init");
			profession_init();
		}
		else if ($(e.target).hasClass("nav-over")) {
			console.log("over_init");
			overtime_init();
		}
		else if ($(e.target).hasClass("nav-staff")) {
			console.log("staff_init");
			staff_init();
		}
		else if ($(e.target).hasClass("nav-allowance")) {
			console.log("allowance_init");
			allowance_dialog_init();
			allowance_init(0, null);
		}
		else if ($(e.target).hasClass("nav-attendance")) {
			console.log("attendane_init");
			attendance_init(0 ,null);
		}
		else if ($(e.target).hasClass("nav-salary")) {
			console.log("salary_init");
			salary_init(0, null, 0, 0);
		}
		else if ($(e.target).hasClass("nav-bonus")) {
			console.log("bonus_init");
			bonus_init(0, "");
		}
	});
	$("#pro_tbody").bind("click", function(e) {
		e.stopPropagation();
		var dom = $(e.target).parent().parent("tr")
		var p_id =  parseInt(dom.attr("p_id"));

		if ($(e.target).hasClass("pro_chg")) {
			$("#profession_dialog .pro_save").unbind("click");

			var name = dom.children(".td_name").text().split("(")[0];
			name = name.substr(0, name.length-1);

			$("#profession_dialog #profession_name").val(name);
			$("#profession_dialog #profession_level").val(parseInt(dom.children(".td_level").text()));
			$("#profession_dialog #profession_salary").val(parseInt(dom.children(".td_salary").text()));
			$("#profession_dialog").modal("show");

			$("#profession_dialog .pro_save").bind("click", function() {
				profession_update(dom, p_id, $("#profession_dialog #profession_name").val(), $("#profession_dialog #profession_level").val(), $("#profession_dialog #profession_salary").val(), false);
				$("#profession_dialog .pro_save").unbind("click");
				staff_pro_init();
			});
		}
		else if ($(e.target).hasClass("pro_del")) {
			$("#ask_dialog .ask_sure").unbind("click");

			$("#ask_dialog .ask_sure").bind("click", function(event) {
				profession_delete(p_id, dom);
				$("#ask_dialog .ask_sure").unbind("click");
			});

			$("#ask_dialog").modal("show");
		}

	});
	$("#profession_add").bind("click", function(e) {
		e.stopPropagation();
		$("#profession_dialog .pro_save").unbind("click");

		$("#profession_dialog #profession_name").val("");
		$("#profession_dialog #profession_level").val(1);
		$("#profession_dialog #profession_salary").val(0);
		$("#profession_dialog").modal("show");

		$("#profession_dialog .pro_save").bind("click", function() {
			profession_update(null, -1, $("#profession_dialog #profession_name").val(), $("#profession_dialog #profession_level").val(), $("#profession_dialog #profession_salary").val(), true);
			$("#profession_dialog .pro_save").unbind("click");
			profession_init();
			staff_pro_init();
		});
	});

	$("#overtime_tbody").bind("click", function(e) {
		e.stopPropagation();
		var dom = $(e.target).parent().parent("tr")
		var p_id =  parseInt(dom.attr("p_id"));

		if ($(e.target).hasClass("overtime_chg")) {
			$("#overtime_dialog .over_save").unbind("click");
			var name = dom.children(".td_name").text().split("(")[0];
			name = name.substr(0, name.length-1);

			$("#overtime_dialog #overtime_name").val(name);
			$("#overtime_dialog #overtime_salary").val(parseInt(dom.children(".td_salary").text()));
			$("#overtime_dialog .over_save").bind("click", function(e) {
				e.stopPropagation();
				overtime_update(dom, p_id, $("#overtime_dialog #overtime_name").val(), $("#overtime_dialog #overtime_salary").val(), 0);
				$("#overtime_dialog .over_save").unbind("click");
			});
			$("#overtime_dialog").modal("show");
		}
		else if ($(e.target).hasClass("overtime_del")) {
			$("#ask_dialog .ask_sure").unbind("click");

			$("#ask_dialog .ask_sure").bind("click", function(e) {
				overtime_delete(dom, p_id);
				$("#ask_dialog .ask_sure").unbind("click");
			});
			$("#ask_dialog").modal("show");
		}
	});

	$("#overtime_add").bind("click", function(e) {
		e.stopPropagation();
		$("overtime_dialog .pro_save").unbind("click");

		$("#overtime_dialog #overtime_name").val("");
		$("#overtime_dialog #overtime_salary").val(0);
		$("#overtime_dialog").modal("show");
		$("#overtime_dialog .over_save").bind("click", function() {
			overtime_update(null, -1, $("#overtime_dialog #overtime_name").val(), $("#overtime_dialog #overtime_salary").val(),1)
			$("overtime_dialog .pro_save").unbind("click");
			overtime_init();
		});
	});

	$("#staff_add").bind("click", function(e) {
		e.stopPropagation();
		$("#staff_dialog .staff_save").unbind("click");

		$("#staff_dialog #staff_name").val("");
		$("#staff_dialog #staff_gender").val(0);
		$("#staff_dialog #staff_pro").val(-1);

		$("#staff_dialog").modal("show");
		$("#staff_dialog .staff_save").bind("click", function(e){
			staff_update(null, -1, $("#staff_dialog #staff_name").val(), $("#staff_dialog #staff_gender").val(), $("#staff_dialog #staff_pro").val(), 1);
			$("#staff_dialog .staff_save").unbind("click");
			staff_init();
		})
	});
	$("#staff_tbody").bind("click", function(e) {
		e.stopPropagation();
		var dom = $(e.target).parent().parent("tr")
		var p_id =  parseInt(dom.attr("p_id"));

		if ($(e.target).hasClass("staff_chg")) {
			$("#staff_dialog .staff_save").unbind("click");
			var name = dom.children(".td_name").text().split("(")[0];
			name = name.substr(0, name.length-1);
			
			$("#staff_dialog #staff_name").val(name);
			$("#staff_dialog #staff_gender").val(gender_text_b[dom.children(".td_gender").text()]);
			$("#staff_dialog #staff_pro").val(dom.children(".td_profession").attr("pro_id"));
			$("#staff_dialog .staff_save").bind("click", function(e) {
				e.stopPropagation();
				staff_update(dom, p_id, $("#staff_dialog #staff_name").val(), $("#staff_dialog #staff_gender").val(), $("#staff_dialog #staff_pro").val(), 0);
				$("#staff_dialog .staff_save").unbind("click");
			});
			$("#staff_dialog").modal("show");
		}
		else if ($(e.target).hasClass("staff_del")) {
			$("#ask_dialog .ask_sure").unbind("click");

			$("#ask_dialog .ask_sure").bind("click", function(e) {
				staff_delete(dom, p_id);
				$("#ask_dialog .ask_sure").unbind("click");
			});
			$("#ask_dialog").modal("show");
		}
	});
	$('#allowance_date').datetimepicker({
		autoclose: true,
		startView: 3,
		minView: 3,
		maxView: 3,
		todayBtn: true,
	});
	$("#allowance_search_1").bind("click", function(e) {
		var date = $("#allowance_date").val();
		var in_date = parseInt(date);
		var name = $("#allowance_s_name").val();
		if (name != "" && date != "" && in_date != NaN) {
			allowance_init(3, {name: name, m_month: in_date});
		}
		else if (date != "" && in_date != NaN) {
			allowance_init(2, {m_month: in_date});
		}
		else if (name != "") {

			allowance_init(1, {name: name});
		}
		else {
			allowance_init(0, null);
		}
	});
	$("#allowance_search_2").bind("click", function(e) {
		allowance_init(0, null);
	});
	$("#allowance_tbody").bind("click", function(e) {
		e.stopPropagation();
		var dom = $(e.target).parent().parent("tr")

		var m_month =  parseInt(dom.children(".td_al_month").text());
		var s_id = parseInt(dom.children(".td_al_name").attr("s_id"));
		var overtime_id = parseInt(dom.children(".td_al_o_name").attr("o_id"));
		var m_time = parseInt(dom.children(".td_al_time").text());

		if ($(e.target).hasClass("al_chg")) {
			$("#allowance_dialog .al_save").unbind("click");

			$("#allowance_dialog #allowance_id").val(s_id).attr({"disabled": true});
			$("#allowance_dialog #allowance_month").val(m_month).attr({"disabled": true});
			$("#allowance_dialog #allowance_o_type").val(overtime_id).attr({"disabled": true});
			$("#allowance_dialog #allowance_time").val(m_time);

			$("#allowance_dialog .al_save").bind("click", function(e) {
				e.stopPropagation();
				allowance_update(dom, {m_month: parseInt($("#allowance_dialog #allowance_month").val()), staff_id: parseInt($("#allowance_dialog #allowance_id").val()), overtime_id: parseInt($("#allowance_dialog #allowance_o_type").val()), m_time: parseInt($("#allowance_dialog #allowance_time").val())}, 0);
				$("#allowance_dialog .al_save").unbind("click");
			});
			$("#allowance_dialog").modal("show");
		}
		else if ($(e.target).hasClass("al_del")) {
			$("#ask_dialog .ask_sure").unbind("click");

			$("#ask_dialog .ask_sure").bind("click", function(e) {
				allowance_delete(dom, m_month, s_id, overtime_id);
				$("#ask_dialog .ask_sure").unbind("click");
			});
			$("#ask_dialog").modal("show");
		}
	});
	$("#allowance_add").bind("click", function() {
		$("#allowance_dialog .al_save").unbind("click");

		$("#allowance_dialog #allowance_id").val("").attr({"disabled": false});
		$("#allowance_dialog #allowance_month").val(1).attr({"disabled": false});
		$("#allowance_dialog #allowance_o_type").val(-1).attr({"disabled": false});
		$("#allowance_dialog #allowance_time").val("");

		$("#allowance_dialog .al_save").bind("click", function(e) {
			e.stopPropagation();
			allowance_update(null, {m_month: parseInt($("#allowance_dialog #allowance_month").val()), staff_id: parseInt($("#allowance_dialog #allowance_id").val()), overtime_id: parseInt($("#allowance_dialog #allowance_o_type").val()), m_time: parseInt($("#allowance_dialog #allowance_time").val())}, 1);
			$("#allowance_dialog .al_save").unbind("click");
		});
		$("#allowance_dialog").modal("show");
	});
	$('#attendance_date').datetimepicker({
		autoclose: true,
		startView: 3,
		minView: 3,
		maxView: 3,
		todayBtn: true,
	});
	$("#attendance_search_1").bind("click", function(e) {
		var date = $("#attendance_date").val();
		var in_date = parseInt(date)
		var name = $("#attendance_s_name").val();

		if (name != "" && date != "" && in_date != NaN) {
			attendance_init(3, {name: name, m_month: date});
		}
		else if (date != "" && in_date != NaN) {
			attendance_init(2, {m_month: date});
		}
		else if (name != "") {
			attendance_init(1, {name: name});
		}
		else {
			attendance_init(0, null);
		}
	});
	$("#attendance_search_2").bind("click", function(e) {
		attendance_init(0, null);
	});
	$("#attendance_tbody").bind("click", function(e) {
		e.stopPropagation();
		var dom = $(e.target).parent().parent("tr")
		var m_month =  parseInt(dom.children(".td_at_month").text());
		var s_id = parseInt(dom.children(".td_at_name").attr("s_id"));
		var leave_time = parseInt(dom.children(".td_at_leave").text());
		var late_time = parseInt(dom.children(".td_at_late").text());
		var absent_time = parseInt(dom.children(".td_at_absent").text());

		if ($(e.target).hasClass("at_chg")) {
			$("#attendance_dialog .at_save").unbind("click");

			$("#attendance_dialog #attendance_id").val(s_id).attr({"disabled": true});
			$("#attendance_dialog #attendance_month").val(m_month).attr({"disabled": true});
			$("#attendance_dialog #attendance_leave").val(leave_time);
			$("#attendance_dialog #attendance_late").val(late_time);
			$("#attendance_dialog #attendance_absent").val(absent_time);

			$("#attendance_dialog .at_save").bind("click", function(e) {
				e.stopPropagation();
				attendance_update(dom, {m_month: parseInt($("#attendance_dialog #attendance_month").val()), staff_id: parseInt($("#attendance_dialog #attendance_id").val()), leave_time: parseInt($("#attendance_dialog #attendance_leave").val()), late_time: parseInt($("#attendance_dialog #attendance_late").val()), absent_time: parseInt($("#attendance_dialog #attendance_absent").val())}, 0);
				$("#attendance_dialog .at_save").unbind("click");
			});
			$("#attendance_dialog").modal("show");
		}
		else if ($(e.target).hasClass("at_del")) {
			$("#ask_dialog .ask_sure").unbind("click");

			$("#ask_dialog .ask_sure").bind("click", function(e) {
				attendance_delete(dom, m_month, s_id);
				$("#ask_dialog .ask_sure").unbind("click");
			});
			$("#ask_dialog").modal("show");
		}
	});
	$("#attendance_add").bind("click", function() {
		$("#attendance_dialog .at_save").unbind("click");

		$("#attendance_dialog #attendance_id").val("").attr({"disabled": false});
		$("#attendance_dialog #attendance_month").val(1).attr({"disabled": false});
		$("#attendance_dialog #attendance_leave").val("");
		$("#attendance_dialog #attendance_late").val("");
		$("#attendance_dialog #attendance_absent").val("");

		$("#attendance_dialog .at_save").bind("click", function(e) {
			e.stopPropagation();
			attendance_update(null, {m_month: parseInt($("#attendance_dialog #attendance_month").val()), staff_id: parseInt($("#attendance_dialog #attendance_id").val()), leave_time: parseInt($("#attendance_dialog #attendance_leave").val()), late_time: parseInt($("#attendance_dialog #attendance_late").val()), absent_time: parseInt($("#attendance_dialog #attendance_absent").val())}, 1);
			$("#attendance_dialog .at_save").unbind("click");
		});
		$("#attendance_dialog").modal("show");
	});
	$('#salary_date').datetimepicker({
		autoclose: true,
		startView: 3,
		minView: 3,
		maxView: 3,
		todayBtn: true,
	});
	$("#salary_search_1").bind("click", function() {
		var m_month = $("#salary_date").val()+"";
		var s_id = $("#salary_s_name").val()+"";

		if (m_month != "" && s_id != "") {
			salary_init(0, {staff_id: parseInt(s_id), m_month: parseInt(m_month)}, 1, 1);
		}
		else if (m_month != "") {
			salary_init(1, {m_month: parseInt(m_month)}, 1, 1);
		}
		else {
			send_msg("更新数据必须要有月份！");
		}
	});
	$("#salary_search_2").bind("click", function() {
		var m_month = $("#salary_date").val()+"";
		var s_id = $("#salary_s_name").val()+"";

		if (m_month != "" && s_id != "") {
			salary_init(3, {staff_id: parseInt(s_id), m_month: parseInt(m_month)}, 0, 1);
		}
		else if (m_month != "") {
			salary_init(2, {m_month: parseInt(m_month)}, 0, 1);
		}
		else if (s_id != "") {
			salary_init(1, {staff_id: parseInt(s_id)}, 0, 1);
		}
		else {
			salary_init(0, null, 0, 1);
		}
	});
	$("#salary_search_3").bind("click", function() {
		var p_id = parseInt($("#salary_p_id").val());
		if (isNaN(p_id)) {
			send_msg("部门ID不能为空或者非数字!");
			return;
		}
		salary_init(4, {profession_id: p_id}, 0, 1);

	});
	$("#salary_download").bind("click", function() {
		var name = $("#salary_down_name").val();
		table_download(name);
	});
	$("#bonus_search").bind("click", function(e) {
		var s_id = $("#bonus_s_id").val();
		if (s_id == "") {
			bonus_init(0, "");
		}
		else {
			bonus_init(1, s_id);
		}
	});
}

window.onload = init;