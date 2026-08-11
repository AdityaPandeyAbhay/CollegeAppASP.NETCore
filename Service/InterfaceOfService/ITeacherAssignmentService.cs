using Data.Data;
using Model.Models;
using Model.Models.TeacherAssignment_Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.InterfaceOfService
{
    public interface ITeacherAssignmentService
    {
        Task<GetTeacherAssignmentDTO> CreateTeacherAssignmentAsync(CreateTeacherAssignmentDTO dto);
        Task<List<GetTeacherAssignmentDTO>> GetAllTeacherAssignmentAsync();
        Task<GetTeacherAssignmentDTO> GetTeacherAssignmentByIdAsync(int id);
        Task<List<GetTeacherAssignmentDTO>> GetTeacherAssignmentByTeacherAsync(int teacherId);
        Task<List<GetTeacherAssignmentDTO>> GetTeacherAssignmentByClassAsync(int classId);
        Task<List<GetTeacherAssignmentDTO>> GetTeacherAssignmentBySubjectAsync(int subjectId);
        Task<bool> UpdateTeacherAssignmentAsync(int id, UpdateTeacherAssignmentDTO dto);
        Task<bool> DeleteTeacherAssignmentAsync(int id);

        Task<List<DropdownDTO>> GetTeacherDropdownAsync(
    int? departmentId,
    int? schoolClassId,
    int? sectionId,
    int? subjectId,
    int? academicYearId);
    }
}
