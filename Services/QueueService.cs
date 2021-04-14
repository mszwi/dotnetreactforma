using DotnetReactFoma.Data;
using DotnetReactFoma.Hubs;
using DotnetReactFoma.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace DotnetReactFoma.Services
{
    public interface IQueueService
    {
        public void AddUser(ApplicationUser user);
        public QueueObject Get(string userId);
        public QueueObject GetByAdmin(string userId);
        public void Update(QueueObject queueObject);
        public void RemoveUser(ApplicationUser user);
        public void UpdateAdmin(ApplicationUser user);
        public void AddAdmin(ApplicationUser user);
        public void RemoveAdmin(ApplicationUser user);
        public List<ApplicationUser> GetAdmins();
        public List<QueueObject> GetQueue();
        public ApplicationUser GetUserByDisplayName(string name);
        public ApplicationUser GetUserByEmail(string email);
        public QueueStatus GetStatus();
        public void SetStatus(QueueStatus status);
        public QueueObject CreateConnection(ApplicationUser admin, ApplicationUser user);
        public void DestroyConnection(ApplicationUser admin, ApplicationUser user);
        public int GetPosition(ApplicationUser user);
        public int GetPosition(string userId);
        IEnumerable<ApplicationUser> GetUsers();
        public void UpdateUser(ApplicationUser user);

        public ApplicationUser NewUser();

       // public KeyValuePair<string, string> UpdateConnection(KeyValuePair<ApplicationUser, ApplicationUser> oldPair, KeyValuePair<ApplicationUser, ApplicationUser> newPair);
    }
    public class QueueService : IQueueService
    {
        public List<QueueObject> Users;
        public QueueStatus QueueStatus;
        public int MessaId;
        private readonly IHubContext<ChatHub> _ChatHub;
        private ApplicationDbContext _AllUsers;
        public List<ApplicationUser> Admins;
        public QueueService(IHubContext<ChatHub> ch)
        {
            Users = new List<QueueObject>();
            Admins = new List<ApplicationUser>();
            QueueStatus = QueueStatus.Closed;
            _ChatHub = ch;
        }

        public void AddUser(ApplicationUser user)
        {
            if (user == null)
            {
                return;
            }

            var item = Users.FirstOrDefault(u => u.User.Id == user.Id);

            if(item == null)
            {
                Users.Add(new QueueObject()
                {
                    User = user,
                    LastActivity = DateTime.Now,
                    CallStatus = CallStatus.Disconnected
                });
            }

               
        }
        public void RemoveUser(ApplicationUser user)
        {
            if (user == null)
            {
                return;
            }


            var item = Users.FirstOrDefault(u => u.User.Id == user.Id);

            if (item != null)
            {
                Users.Remove(item);
            }


        }

        public QueueObject Get(string userId)
        {
            return Users.FirstOrDefault(u => u.User.Id == userId);
        }

        public QueueObject GetByAdmin(string userId)
        {
            return Users.FirstOrDefault(u => u.ConnectedAdmin != null && u.ConnectedAdmin.Id == userId);
        }

        public void Update(QueueObject queueObject)
        {
            var obj = Users.FirstOrDefault(u => u.User.Id == queueObject.User.Id);
            if(obj != null)
            {
                Users.Replace(obj, queueObject);
            }
        }
        public void UpdateAdmin(ApplicationUser user)
        {
            if (user == null)
            {
                return;
            }

            var item = Admins.FirstOrDefault(u => u.Id == user.Id);

            if (item == null)
            {
                return;
            }

            Admins.Replace(item, user);

            var queueItem = Users.FirstOrDefault(u =>u.ConnectedAdmin != null && u.ConnectedAdmin.Id == user.Id);
            if(queueItem != null)
            {
                queueItem.ConnectedAdmin = user;
                Update(queueItem);

            }

        }
        public void AddAdmin(ApplicationUser user)
        {
            if (user == null)
            {
                return;
            }

            var item = Admins.FirstOrDefault(u => u.Id == user.Id);

            if (item == null)
            {
                Admins.Add(user);
            }


        }
        public void RemoveAdmin(ApplicationUser user)
        {
            if (user == null)
            {
                return;
            }


            var item = Admins.FirstOrDefault(u => u.Id == user.Id);

            if (item != null)
            {
                Admins.Remove(item);
            }


        }

        public List<ApplicationUser> GetAdmins()
        {
            return Admins;
        }


        public List<QueueObject> GetQueue()
        {
            return Users;
        }


        public IEnumerable<ApplicationUser> GetUsers()
        {
            return Users.Select(q => q.User);

        }

        public int GetPosition(ApplicationUser user)
        {
            var item = Users.FirstOrDefault(u => u.User.Id == user.Id);
            if(item == null)
            {
                return -1;
            }
            var index = Users.IndexOf(item);
            return index;
        }

        public int GetPosition(string userId)
        {
            var item = Users.FirstOrDefault(u => u.User.Id == userId);
            if (item != null)
            {
                return Users.IndexOf(item);
            }
            return -1;
        }

        public ApplicationUser GetUserByDisplayName(string name)
        {
            var queueObject = Users.FirstOrDefault(q => q.User.DisplayName == name);
            if(queueObject != null)
            {
                return queueObject.User;
            }
            return null;

        }


        public ApplicationUser GetUserByEmail(string email)
        {
            var queueObject = Users.FirstOrDefault(q => q.User.Email == email);
            if (queueObject != null)
            {
                return queueObject.User;
            }
            return null;
        }

        public void UpdateUser(ApplicationUser user)
        {
            var item = Users.FirstOrDefault(u => u.User.Id == user.Id);
            if(item != null)
            {
                item.User = user;
            }
        }
        //public void AddAdmin(AdminUser user)
        //{
        //    if (user == null || Admins.Contains(user))
        //    {
        //        return;
        //    }

        //    Admins.Add(user);
        //    if(Admins.Count() == 1)
        //    {
        //        SetStatus(QueueStatus.Open);
        //    }
        //}
        //public void RemoveAdmin(AdminUser user) {
        //    if (user == null || Admins.Contains(user))
        //    {
        //        return;
        //    }

        //    Admins.Remove(user);
        //    if (Admins.Count() == 0)
        //    {
        //        SetStatus(QueueStatus.Closed);
        //    }
        //}
        //public AdminUser GetAdminByDisplayName(string name)
        //{
        //    return Admins.Find(a => a.DisplayName == name);
        //}

        //public AdminUser GetAdminByConnectionId(string id)
        //{
        //    return Admins.Find(a => a.ConnectionId == id);

        //}
        //public List<AdminUser> GetAdmins() {
        //    return Admins;
        //}
        public QueueStatus GetStatus()
        {
            if (Admins.Where(u => u.Status != UserStatus.Offline).Count() == 0 && QueueStatus == QueueStatus.Open)
            {
                SetStatus(QueueStatus.Closed);
            }
            else if (Admins.Where(u => u.Status != UserStatus.Offline).Count() > 0 && QueueStatus == QueueStatus.Closed)
            {
                SetStatus(QueueStatus.Open);

            }

            return QueueStatus;
        }
        public void SetStatus(QueueStatus status)
        {
            QueueStatus = status;
            _ChatHub.Clients.Group("Users").SendAsync("QueueStatus", status);
            _ChatHub.Clients.Group("Admin").SendAsync("QueueStatus", status);

        }

     
        public QueueObject CreateConnection(ApplicationUser admin, ApplicationUser user)
        {
            var item = Users.FirstOrDefault(u => u.User.Id == user.Id);
            if(item == null)
            {
                throw new Exception("Couldn't find that user");
            }

            if (item.ConnectedAdmin != null && item.ConnectedAdmin.Id != admin.Id)
            {
                throw new Exception("You are already connected to someone else");
            }

            item.CallStatus = CallStatus.Calling;
            item.ConnectedAdmin = admin;
            Update(item);
            return item;

        }

        public void DestroyConnection(ApplicationUser admin, ApplicationUser user)
        {
            var item = Users.FirstOrDefault(u => u.User.Id == user.Id);
            if(item == null) {
                return;
            }

            item.ConnectedAdmin = null;
            item.CallStatus = CallStatus.Disconnected;
            Update(item);
        }
        public ApplicationUser NewUser()
        {
            var pieces = Guid.NewGuid().ToString().Split('-');
            var userEmail = $"{pieces[0]}@{pieces[1]}.{pieces[2]}";
            var userName = Guid.NewGuid().ToString();

            var user = new ApplicationUser { Email = userEmail, UserName = userName, Type = UserType.User };
            return user;
        }



    }

    public enum QueueStatus
    {
        Closed, Open
    }


    //public interface IChatUser
    //{
    //    [JsonPropertyName("displayName")]
    //    public string DisplayName { get; set; }

    //    [JsonPropertyName("connectionId")]
    //    public string ConnectionId { get; set; }

    //    [JsonPropertyName("email")]
    //    public string Email { get; set; }

    //    [JsonPropertyName("phone")]
    //    public string Phone { get; set; }

    //    [JsonPropertyName("status")]
    //    public UserStatus Status { get; set; }

    //    [JsonPropertyName("type")]
    //    public UserType Type { get; set; }

    //    [JsonPropertyName("contactSubject")]
    //    public ContactSubject ContactSubject { get; set; }

    //}

    //public class AdminUser : IChatUser
    //{
    //    public string DisplayName { get; set; }
    //    public string ConnectionId { get; set; }
    //    public string Email { get; set; }
    //    public string Phone { get; set; }
    //    public UserStatus Status { get; set; }
    //    public UserType Type { get; set; }
    //    public ContactSubject ContactSubject { get; set; }
    //    public string WherebyLink { get; set; }
    //}

    //public class PublicUser : IChatUser
    //{
    //    public string DisplayName { get; set; }
    //    public string ConnectionId { get; set; }
    //    public string Email { get; set; }
    //    public string Phone { get; set; }
    //    public UserStatus Status { get; set; }
    //    public UserType Type { get; set; }
    //    public ContactMethodType ContactMethod { get; set; }
    //    public ContactSubject ContactSubject { get; set; }

    //    public string UserIdentifier { get; set; }
    //}


}

public class QueueObject
{
    public ApplicationUser User { get; set; }
    public DateTime LastActivity { get; set; }
    public ApplicationUser ConnectedAdmin { get; set; }
    public CallStatus CallStatus { get; set; }
}

public enum CallStatus
{
    Disconnected, Calling, Connected
}


namespace System.Collections.Generic
{
    public static class Extensions
    {
        public static int Replace<T>(this IList<T> source, T oldValue, T newValue)
        {
            if (source == null)
                throw new ArgumentNullException("source");

            var index = source.IndexOf(oldValue);
            if (index != -1)
                source[index] = newValue;
            return index;
        }

        public static void ReplaceAll<T>(this IList<T> source, T oldValue, T newValue)
        {
            if (source == null)
                throw new ArgumentNullException("source");

            int index = -1;
            do
            {
                index = source.IndexOf(oldValue);
                if (index != -1)
                    source[index] = newValue;
            } while (index != -1);
        }


        public static IEnumerable<T> Replace<T>(this IEnumerable<T> source, T oldValue, T newValue)
        {
            if (source == null)
                throw new ArgumentNullException("source");

            return source.Select(x => EqualityComparer<T>.Default.Equals(x, oldValue) ? newValue : x);
        }
    }
}