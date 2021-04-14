using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DotnetReactFoma.Models
{
    public class CallLog
    {
        public int CallLogId { get; set; }
        public int MessaId { get; set; }
        public DateTime EventTime { get; set; }
        public CallLogType EventType { get; set; }
        public ApplicationUser Admin { get; set; }
        public ApplicationUser User { get; set; }
        public ContactMethodType CallType { get; set; }
    }
    public enum CallLogType
    {
        AttemptedByAdmin, CancelledByAdmin, CancelledByUser, AnsweredByUser, DisconnectedByAdmin, ForcedByAdmin, DisconnectedByUser
    }
    public class CallEvent
    {
        public int CallEventId { get; set; }
        public int MessaId { get; set; }
    }

}
