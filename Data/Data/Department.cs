namespace CollegeApp.Data
{
    public class Department
    {
        public int Id { get; set; }
        
        public string DepartmentName { get; set; } = string.Empty;

        public string Desciption{  get; set; } = string.Empty;

        public virtual ICollection<Student> Students { get; set; }
    }
}
