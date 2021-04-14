using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DotnetReactFoma.Models
{
    public class CompetitionEntry
    {
        public int CompetitionEntryId { get; set; }
        public int MessaId { get; set; }
        public int CompetitionId { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public ApplicationUser User { get; set; }
        public bool Trekt { get; set; }
        public int Rank { get; set; }

    }




}
