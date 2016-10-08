create database m_salary DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
create table bonus(staff_id int(4) not null, bonus int(4), foreign key(staff_id) references `staff_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE);
create trigger bonus_get1
after insert on salary
for each row
begin
set @sum = (select sum(salary) from salary where staff_id = new.staff_id group by staff_id);
update bonus set bonus=@sum where staff_id=new.staff_id;
end//