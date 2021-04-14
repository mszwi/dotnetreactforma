using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DotnetReactFoma.Models
{
    public class Message
    {
        public int MessageId { get; set; }
        public string Content { get; set; }
        public ApplicationUser From { get; set; }
        public ApplicationUser To { get; set; }
        public DateTime Date { get; set; }
    }
}
