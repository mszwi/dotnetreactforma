using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DotnetReactFoma.Models
{
    public class ConnectionLog
    {
        public int ConnectionLogId { get; set; }
        public int MessaId { get; set; }
        public DateTime EventTime { get; set; }
        public ConnectionLogType EventType { get; set; }
        public ApplicationUser UserIdentifier { get; set; }


    }

    public enum ConnectionLogType
    {
        Connected,Disconnected
    }
}
