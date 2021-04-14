using DotnetReactFoma.Services;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using DotnetReactFoma.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication;
using System.Text.Json.Serialization;
using DotnetReactFoma.Data;
using Microsoft.EntityFrameworkCore;

namespace DotnetReactFoma.Hubs
{
    public class EmailBasedUserIdProvider : IUserIdProvider
    {
        public virtual string GetUserId(HubConnectionContext connection)
        {
            return connection.User?.FindFirst(ClaimTypes.Email)?.Value;
        }
    }

    public class NameUserIdProvider : IUserIdProvider
    {
        public string GetUserId(HubConnectionContext connection)
        {
            Console.WriteLine("************ Getting User ID **********");
            var UserId = connection.User?.FindFirst(x => x.Type == ClaimTypes.NameIdentifier);
            Console.WriteLine("************ ID: " + UserId?.Value);
            return UserId?.Value;
        }
    }

    public static class UserHandler
    {
        public static Dictionary<string, List<string>> ConnectedIds = new Dictionary<string, List<string>>();
    }
    public class ChatHub : Hub
    {
        public IQueueService _QueueService;
        private UserManager<ApplicationUser> _Users;
        private static IMessaService _MessaService;
        ApplicationDbContext _ApplicationDbContext;
        RoleManager<IdentityRole> _Roles;
        public ChatHub(IQueueService q, IMessaService ms, UserManager<ApplicationUser> usrs, ApplicationDbContext adb, RoleManager<IdentityRole> rm)
        {
            _QueueService = q;
            _MessaService = ms;
            _ApplicationDbContext = adb;
            _Users = usrs;
            _Roles = rm;
            CheckRolesExist().Wait();
        }


        public async Task CheckRolesExist()
        {
            var adminRole = await _Roles.FindByNameAsync("Administrator");
            if(adminRole == null)
            {
                var newAdminRole = new IdentityRole("Administrator");
                await _Roles.CreateAsync(newAdminRole);
            }
        }

        public string CreateEmail()
        {
            var pieces = Guid.NewGuid().ToString().Split('-');
            return $"{pieces[0]}@{pieces[1]}.{pieces[2]}";
        }

        public string CreateName()
        {
            return Guid.NewGuid().ToString();
        }

        public async override Task OnConnectedAsync()
        {

            await base.OnConnectedAsync();

        }

        public async override Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);

            var obj = UserHandler.ConnectedIds.FirstOrDefault(u => u.Value.Contains(Context.ConnectionId));
            if(obj.Value != null){
                UserHandler.ConnectedIds[obj.Key].Remove(Context.ConnectionId);
                if(UserHandler.ConnectedIds[obj.Key].Count() == 0)
                {
                    UserHandler.ConnectedIds.Remove(obj.Key);
                }
            }
            await Clients.Group("Admin").SendAsync("Connections", UserHandler.ConnectedIds);

        }

        
        public async Task AddUserToGroup(ApplicationUser userIn)
        {
            Console.WriteLine("************ Adding user to group **********");
            try
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Users");

                /*var claimPrinciple = Context.User.FindFirst(c =>
                       c.Type == ClaimTypes.NameIdentifier);
                    */
                var user = await _Users.FindByIdAsync(userIn.Id);

                if (userIn == null || user == null)
                {
                    user = _QueueService.NewUser();
                    await _Users.CreateAsync(user);
                    await Clients.Caller.SendAsync("YourStatus", user);

                }

                //    Console.WriteLine("************ Creating anonymous user **********");
                //    userIn = new ApplicationUser { Email = CreateEmail(), UserName = CreateName() };
                //    userIn.Type = UserType.User;
                //    var result = await _Users.CreateAsync(userIn);

                //    await _Users.AddClaimAsync(userIn, new Claim(ClaimTypes.Email, userIn.Email));
                //    await _Users.AddClaimAsync(userIn, new Claim(ClaimTypes.Name, userIn.UserName));
                //   // var token = await _Users.GetAuthenticationTokenAsync(userIn, "PasswordlessLoginTotpProvider", "passwordless-auth");

                //    //await Clients.Caller.SendAsync("Token", token);
                //}

                if (UserHandler.ConnectedIds.ContainsKey(user.Id))
                {
                    Console.WriteLine("************ User has multiple connections **********");

                    UserHandler.ConnectedIds[user.Id].Add(Context.ConnectionId);
                }
                else
                {
                    Console.WriteLine("************ Creating a new connection Object **********");

                    UserHandler.ConnectedIds.Add(user.Id, new List<string>() { Context.ConnectionId });
                }
                //await Clients.Caller.SendAsync("YourStatus", userIn);

                if (UserHandler.ConnectedIds.TryGetValue(user.Id, out var cids))
                {
                    await Clients.Clients(cids).SendAsync("YourPosition", _QueueService.GetPosition(user.Id));
                    await Clients.Clients(cids).SendAsync("QueueStatus", _QueueService.GetStatus());
                    await Clients.Clients(cids).SendAsync("YourStatus", user);
                    var queueObject = _QueueService.Get(user.Id);
                    if (queueObject == null && user.ContactMethod != ContactMethodType.Undefined && user.ContactSubject != ContactSubject.Undefined)
                    {
                        await JoinQueue(user);
                    }

                    if (queueObject != null && queueObject.ConnectedAdmin != null)
                    {
                        if (queueObject.CallStatus == CallStatus.Connected)
                        {
                            await Clients.Clients(cids).SendAsync("Answer", new CallRequest()
                            {
                                AdminId = queueObject.ConnectedAdmin.Id,
                                AdminEmail = queueObject.ConnectedAdmin.Email,
                                AdminPhone = queueObject.ConnectedAdmin.PhoneNumber,
                                AdminDisplayName = queueObject.ConnectedAdmin.DisplayName,
                                ContactMethod = user.ContactMethod,
                                WherebyLink = queueObject.ConnectedAdmin.WherebyLink,
                                UserId = user.Id
                            });
                        }
                        else if (queueObject.CallStatus == CallStatus.Calling)
                        {
                            await Clients.Clients(cids).SendAsync("Call", new CallRequest()
                            {
                                AdminId = queueObject.ConnectedAdmin.Id,
                                AdminEmail = queueObject.ConnectedAdmin.Email,
                                AdminPhone = queueObject.ConnectedAdmin.PhoneNumber,
                                AdminDisplayName = queueObject.ConnectedAdmin.DisplayName,
                                ContactMethod = user.ContactMethod,
                                WherebyLink = queueObject.ConnectedAdmin.WherebyLink,
                                UserId = user.Id
                            });
                        }

                        var messages = _ApplicationDbContext.Messages.Where(m => (m.From.Id == user.Id || m.To.Id == user.Id) && (m.From.Id == queueObject.ConnectedAdmin.Id || m.To.Id == queueObject.ConnectedAdmin.Id)).ToList();
                        await Clients.Clients(cids).SendAsync("Messages", messages);

                    }
                }

                await Clients.Group("Admin").SendAsync("Connections", UserHandler.ConnectedIds);


            } catch(Exception e)
            {
                await Clients.Caller.SendAsync("Error", e.Message);
            }

            //await Clients.Group("Admin").SendAsync("Send", $"{Context.ConnectionId} has joined the group Users.");
            //await Clients.Group("Admin").SendAsync("ClientList", _QueueService.GetQueue());
        }

        [Authorize]
        public async Task AddAdminToGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admin");
            string username = Context.User.Identity.Name;
            Console.WriteLine(username);

            var claimPrinciple = Context.User.FindFirst(c =>
                   c.Type == ClaimTypes.NameIdentifier);


            
            //var admin = new ApplicationUser() { ActiveConnectionIds = new List<string>() { Context.ConnectionId }.ToArray(), Type = UserType.Admin, Status = UserStatus.Offline };
            var adminUser = await _Users.FindByIdAsync(claimPrinciple.Value);
            Console.WriteLine("************ Adding Admin user to group **********");
            Console.WriteLine("Claim: " + claimPrinciple.Value);
            Console.WriteLine("Name: " + Context.User?.Identity?.Name);
            Console.WriteLine("User: " + JsonConvert.SerializeObject(adminUser));
            if (adminUser != null)
            {
                if (adminUser.Type != UserType.Admin)
                {
                    adminUser.Type = UserType.Admin;
                    await _Users.UpdateAsync(adminUser);

                }
                //if (! await _Users.IsInRoleAsync(adminUser, "Administrator"))
                //{
                //    await _Users.AddToRoleAsync(adminUser, "Administrator");

                //}
                _QueueService.AddAdmin(adminUser);
                var logs = _ApplicationDbContext.CallLogs.Include(log => log.User).Include(log => log.Admin).Where(log => log.MessaId == _MessaService.GetCurrentMesseId()).ToList();

                if (UserHandler.ConnectedIds.TryGetValue(adminUser.Id, out var connectionIds))
                {
                    connectionIds.Add(Context.ConnectionId);
                    await Clients.Clients(connectionIds).SendAsync("CallLog", logs);
                    var queueObject = _QueueService.GetByAdmin(adminUser.Id);
                    if (queueObject != null && queueObject.ConnectedAdmin != null)
                    {
                        var messages = _ApplicationDbContext.Messages.Where(m => (m.From.Id == adminUser.Id || m.To.Id == adminUser.Id) && (m.From.Id == queueObject.ConnectedAdmin.Id || m.To.Id == queueObject.ConnectedAdmin.Id)).ToList();
                        await Clients.Clients(connectionIds).SendAsync("Messages", messages);

                    }
                } else
                {
                    UserHandler.ConnectedIds.Add(adminUser.Id, new List<string>() { Context.ConnectionId });
                    await Clients.Caller.SendAsync("CallLog", logs);

                }
                await Clients.All.SendAsync("QueueStatus", _QueueService.GetStatus());
                await Clients.Caller.SendAsync("ClientList", _QueueService.GetQueue());
                await Clients.Caller.SendAsync("YourStatus", adminUser);
                await Clients.Group("Admin").SendAsync("AdminList", _QueueService.GetAdmins());
                await Clients.Caller.SendAsync("Connections", UserHandler.ConnectedIds);
               

            }
        }

        [Authorize]
        public async Task RemoveAdminFromGroup(string UserId)
        {
            if (string.IsNullOrEmpty(UserId))
            {
                return;
            }


            var admin = await _Users.FindByIdAsync(UserId);
            if (admin == null)
            {
                return;
            }

            if(UserHandler.ConnectedIds.TryGetValue(UserId, out var connectionIds)){
                foreach(var cId in connectionIds)
                {
                    await Groups.RemoveFromGroupAsync(cId, "Admin");

                }

            }
            _QueueService.RemoveAdmin(admin);

            admin.Status = UserStatus.Offline;
            await _Users.UpdateAsync(admin);

            await Clients.All.SendAsync("QueueStatus", _QueueService.GetStatus());
            await Clients.Caller.SendAsync("YourStatus", false);
            await Clients.Group("Admin").SendAsync("AdminList", _QueueService.GetAdmins());
        }

        public async Task RemoveUserFromGroup(string connectionId)
        {
            await Groups.RemoveFromGroupAsync(connectionId, "Users");
            var item = UserHandler.ConnectedIds.First(u => u.Value.Contains(connectionId));

            if (item.Key == null)
            {
                return;
            }

            UserHandler.ConnectedIds[item.Key].Remove(connectionId);

            await Clients.Client(connectionId).SendAsync("Disconnect");
            await Clients.Group("Users").SendAsync("QueueLengthUpdate", _QueueService.GetUsers().Count());
            await Clients.Group("Admin").SendAsync("Send", $"{Context.ConnectionId} has left the group Users.");
            await Clients.Group("Admin").SendAsync("ClientList", _QueueService.GetQueue());

        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendPrivateMessage(string fromId, string toId, string content)
        {
            var to = await _Users.FindByIdAsync(toId);
            var from = await _Users.FindByIdAsync(fromId);
            var message = new Message()
            {
                Content = content,
                Date = DateTime.Now,
                To = to,
                From = from
            };

            _ApplicationDbContext.Messages.Add(message);
            await _ApplicationDbContext.SaveChangesAsync();

            if (UserHandler.ConnectedIds.TryGetValue(toId, out var connectionIds))
            {
                await Clients.Clients(connectionIds).SendAsync("ReceiveMessage", message);
            }

            if (UserHandler.ConnectedIds.TryGetValue(fromId, out var SenderConnectionIds))
            {
                await Clients.Clients(SenderConnectionIds).SendAsync("ReceiveMessage", message);
            }

        }

        [Authorize]
        public async Task ClientList()
        {
            await Clients.Caller.SendAsync("ClientList", _QueueService.GetQueue());
        }

        [Authorize]
        public async Task Ring(ApplicationUser customerIn)
        {
            try { 
            var claimPrinciple = Context.User.FindFirst(c =>
                               c.Type == ClaimTypes.NameIdentifier);

            var admin = await _Users.FindByIdAsync(claimPrinciple.Value); 
            var customer = await _Users.FindByIdAsync(customerIn.Id);
            if (admin == null || customer == null)
            {
                return;
            }

            admin.Status = UserStatus.Busy;
            await _Users.UpdateAsync(admin);
            _QueueService.UpdateAdmin(admin);

            customer.Status = UserStatus.Busy;
            await _Users.UpdateAsync(customer);
            _QueueService.UpdateUser(customer);

            _QueueService.CreateConnection(admin, customer);

                var log = new CallLog
                {
                    MessaId = _MessaService.GetCurrentMesseId(),
                    EventTime = DateTime.Now,
                    EventType = CallLogType.AttemptedByAdmin,
                    Admin = admin,
                    User = customer,
                    CallType = customer.ContactMethod
                };

                _ApplicationDbContext.CallLogs.Add(log);
                _ApplicationDbContext.SaveChanges();
                await SendCallLogs();

                if (UserHandler.ConnectedIds.TryGetValue(customer.Id, out var userConnectionIds))
            {
                    await Clients.Clients(userConnectionIds).SendAsync("Call", new CallRequest()
                    {
                        AdminId = admin.Id,
                        AdminEmail = admin.Email,
                        AdminPhone = admin.PhoneNumber,
                        AdminDisplayName = admin.DisplayName,
                        ContactMethod = customer.ContactMethod,
                        WherebyLink = admin.WherebyLink,
                        UserId = customer.Id
                    });

            }

            await Clients.Group("Admin").SendAsync("AdminList", _QueueService.GetAdmins());
            await Clients.Group("Admin").SendAsync("ClientList", _QueueService.GetQueue());
            }
            catch (Exception e)
            {
                await Clients.Caller.SendAsync("Error", e.Message);

            }
        }

        [Authorize]

        public async Task CancelCall(QueueObject queueObject)
        {
            var admin = await _Users.FindByIdAsync(queueObject.ConnectedAdmin.Id);
            admin.Status = UserStatus.Available;
            await _Users.UpdateAsync(admin);
            _QueueService.UpdateAdmin(admin);

            var user = await _Users.FindByIdAsync(queueObject.User.Id);
            user.Status = UserStatus.Available;
            await _Users.UpdateAsync(user);
            _QueueService.UpdateUser(user);

            _QueueService.DestroyConnection(admin, user);

            var log = new CallLog
            {
                MessaId = _MessaService.GetCurrentMesseId(),
                EventTime = DateTime.Now,
                EventType = CallLogType.CancelledByAdmin,
                Admin = admin,
                CallType = user.ContactMethod,
                User = user,
            };

            _ApplicationDbContext.CallLogs.Add(log);
            _ApplicationDbContext.SaveChanges();
            await SendCallLogs();

            if (UserHandler.ConnectedIds.TryGetValue(user.Id, out var cids))
            {
                await Clients.Clients(cids).SendAsync("CancelCall");
            }

            await Clients.Group("Admin").SendAsync("ClientList", _QueueService.GetQueue());
            await Clients.Group("Admin").SendAsync("AdminList", _QueueService.GetAdmins());
        }

        public async Task DisconnectUser(ApplicationUser userInn)
        {
            var queueObject = _QueueService.Get(userInn.Id);
            var admin = await _Users.FindByIdAsync(queueObject.ConnectedAdmin.Id);
            var user = await _Users.FindByIdAsync(userInn.Id);
            _QueueService.DestroyConnection(admin, user);

            var log = new CallLog
            {
                MessaId = _MessaService.GetCurrentMesseId(),
                EventTime = DateTime.Now,
                EventType = CallLogType.DisconnectedByUser,
                Admin = admin,
                User = user,
                CallType = user.ContactMethod

            };

            _ApplicationDbContext.CallLogs.Add(log);
            await _ApplicationDbContext.SaveChangesAsync();
            await SendCallLogs();

            _QueueService.RemoveUser(user);
            user.ContactMethod = ContactMethodType.Undefined;
            user.ContactSubject = ContactSubject.Undefined;
            admin.Status = UserStatus.Available;
            user.Status = UserStatus.Available;

            await _Users.UpdateAsync(admin);
            await _Users.UpdateAsync(user);
            if (UserHandler.ConnectedIds.TryGetValue(user.Id, out var cids))
            {
                await Clients.Clients(cids).SendAsync("YourPosition", _QueueService.GetPosition(user.Id));
                await Clients.Clients(cids).SendAsync("Disconnect");
                await Clients.Clients(cids).SendAsync("YourStatus", user);

            }

            if (UserHandler.ConnectedIds.TryGetValue(admin.Id, out var Acids))
            {
                await Clients.Clients(Acids).SendAsync("Disconnect");
            }

            var queue = _QueueService.GetQueue();
            foreach (var queued in queue)
            {
                if (UserHandler.ConnectedIds.TryGetValue(queued.User.Id, out var qcids))
                {
                    await Clients.Clients(qcids).SendAsync("YourPosition", _QueueService.GetPosition(queued.User));
                }
            }
            await Clients.Group("Admin").SendAsync("ClientList", queue);
            await Clients.Group("Admin").SendAsync("AdminList", _QueueService.GetAdmins());
        }

        [Authorize]
        public async Task DisconnectAdmin(string id)
        {
            var claimPrinciple = Context.User.FindFirst(c =>
                                          c.Type == ClaimTypes.NameIdentifier);

            var admin = await _Users.FindByIdAsync(claimPrinciple.Value); 
            var user = await _Users.FindByIdAsync(id);

            if(user == null || admin == null)
            {
                return;
            }

            _QueueService.DestroyConnection(admin, user);

            var log = new CallLog
            {
                MessaId = _MessaService.GetCurrentMesseId(),
                EventTime = DateTime.Now,
                EventType = CallLogType.DisconnectedByAdmin,
                Admin = admin,
                User = user,
                CallType = user.ContactMethod

            };

            _ApplicationDbContext.CallLogs.Add(log);
            await _ApplicationDbContext.SaveChangesAsync();
            await SendCallLogs();

            _QueueService.RemoveUser(user);
            user.ContactMethod = ContactMethodType.Undefined;
            user.ContactSubject = ContactSubject.Undefined;
            admin.Status = UserStatus.Available;
            user.Status = UserStatus.Available;
            await _Users.UpdateAsync(admin);
            await _Users.UpdateAsync(user);
            _QueueService.UpdateAdmin(admin);

            if (UserHandler.ConnectedIds.TryGetValue(user.Id, out var cids)){
                await Clients.Clients(cids).SendAsync("YourPosition", _QueueService.GetPosition(user.Id));
                await Clients.Clients(cids).SendAsync("Disconnect");
                await Clients.Clients(cids).SendAsync("YourStatus", user);

            }

            if (UserHandler.ConnectedIds.TryGetValue(admin.Id, out var Acids))
            {
                await Clients.Clients(Acids).SendAsync("Disconnect");
            }

            var queue = _QueueService.GetQueue();
            foreach (var queued in queue)
            {
                if (UserHandler.ConnectedIds.TryGetValue(queued.User.Id, out var qcids)){
                    await Clients.Clients(qcids).SendAsync("YourPosition", _QueueService.GetPosition(queued.User));
                }
            }
            await Clients.Group("Admin").SendAsync("ClientList", queue);
            await Clients.Group("Admin").SendAsync("AdminList", _QueueService.GetAdmins());
        }

        [Authorize]
        public async Task DeleteUser(string id)
        {
            var claimPrinciple = Context.User.FindFirst(c =>
                                          c.Type == ClaimTypes.NameIdentifier);

            var admin = await _Users.FindByIdAsync(claimPrinciple.Value);
            var qObject = _QueueService.Get(id);
            _QueueService.RemoveUser(qObject.User);
            var user = await _Users.FindByIdAsync(qObject.User.Id);
            user.ContactMethod = ContactMethodType.Undefined;
            user.ContactSubject = ContactSubject.Undefined;
            user.Status = UserStatus.Available;
            await _Users.UpdateAsync(user);

            if (UserHandler.ConnectedIds.TryGetValue(user.Id, out var cids))
            {
                await Clients.Clients(cids).SendAsync("YourPosition", _QueueService.GetPosition(user.Id));
                await Clients.Clients(cids).SendAsync("Disconnect");
                await Clients.Clients(cids).SendAsync("YourStatus", user);

            }

            if (UserHandler.ConnectedIds.TryGetValue(admin.Id, out var Acids))
            {
                await Clients.Clients(Acids).SendAsync("Disconnect");
            }

            var queue = _QueueService.GetQueue();
            foreach (var queued in queue)
            {
                if (UserHandler.ConnectedIds.TryGetValue(queued.User.Id, out var qcids))
                {
                    await Clients.Clients(qcids).SendAsync("YourPosition", _QueueService.GetPosition(queued.User));
                }
            }
            await Clients.Group("Admin").SendAsync("ClientList", queue);
            await Clients.Group("Admin").SendAsync("AdminList", _QueueService.GetAdmins());
        }

        public async Task Answer(CallRequest request)
        {
            try
            {
                var user = await _Users.FindByIdAsync(request.UserId);
                user.Status = UserStatus.Busy;
                await _Users.UpdateAsync(user);
                
                var adminUser = await _Users.FindByIdAsync(request.AdminId);
                adminUser.Status = UserStatus.Busy;
                await _Users.UpdateAsync(adminUser);


                if (user == null)
                {
                    throw (new Exception("User is null"));
                }
                if (adminUser == null)
                {
                    throw (new Exception("Admin is null"));
                }

                var queueItem = _QueueService.Get(request.UserId);
                queueItem.CallStatus = CallStatus.Connected;
                _QueueService.Update(queueItem);


                var log = new CallLog
                {
                    MessaId = _MessaService.GetCurrentMesseId(),
                    EventTime = DateTime.Now,
                    EventType = CallLogType.AnsweredByUser,
                    Admin = adminUser,
                    CallType = user.ContactMethod,
                    User = user,
                };

                _ApplicationDbContext.CallLogs.Add(log);
                await _ApplicationDbContext.SaveChangesAsync();
                await SendCallLogs();

                var messages = _ApplicationDbContext.Messages.Where(m => (m.From.Id == user.Id || m.To.Id == user.Id) && (m.From.Id == adminUser.Id || m.To.Id == adminUser.Id)).ToList();


                if (UserHandler.ConnectedIds.TryGetValue(user.Id, out var cids))
                {
                    await Clients.Clients(cids).SendAsync("Answer", request);
                    await Clients.Clients(cids).SendAsync("Messages", messages);

                }

                if (UserHandler.ConnectedIds.TryGetValue(adminUser.Id, out var AdminCids))
                {
                    await Clients.Clients(AdminCids).SendAsync("Answer", request);
                    await Clients.Clients(AdminCids).SendAsync("Messages", messages);
                }

                await Clients.Group("Admin").SendAsync("ClientList", _QueueService.GetQueue());
                await Clients.Group("Admin").SendAsync("AdminList", _QueueService.GetAdmins());
            }
            catch (Exception e)
            {
                await Clients.Caller.SendAsync("Error", e.Message);
                Console.WriteLine(e.StackTrace);
            }

        }

        [Authorize]
        public async Task ForceAnswer(string userId)
        {
            try
            {
                var user = await _Users.FindByIdAsync(userId);

                var claimPrinciple = Context.User.FindFirst(c =>
                                         c.Type == ClaimTypes.NameIdentifier);

                var admin = await _Users.FindByIdAsync(claimPrinciple.Value);

                if (user == null)
                {
                    throw (new Exception("User is null"));
                }
                if (admin == null)
                {
                    throw (new Exception("Admin is null"));
                }

                var request = new CallRequest()
                {
                    AdminId = admin.Id,
                    AdminEmail = admin.Email,
                    AdminPhone = admin.PhoneNumber,
                    AdminDisplayName = admin.DisplayName,
                    ContactMethod = user.ContactMethod,
                    WherebyLink = admin.WherebyLink,
                    UserId = user.Id
                };

               /* var queueItem = _QueueService.Get(user.Id);
                queueItem.CallStatus = CallStatus.Connected;
                _QueueService.Update(queueItem);*/
                var queueItem = _QueueService.CreateConnection(admin, user);
                queueItem.CallStatus = CallStatus.Connected;
                _QueueService.Update(queueItem);

                var log = new CallLog
                {
                    MessaId = _MessaService.GetCurrentMesseId(),
                    EventTime = DateTime.Now,
                    EventType = CallLogType.ForcedByAdmin,
                    Admin = admin,
                    User = user,
                    CallType = user.ContactMethod

                };

                _ApplicationDbContext.CallLogs.Add(log);
                await _ApplicationDbContext.SaveChangesAsync();
                await SendCallLogs();

                var messages = _ApplicationDbContext.Messages.Where(m => (m.From.Id == user.Id || m.To.Id == user.Id) && (m.From.Id == admin.Id || m.To.Id == admin.Id)).ToList();


                if (UserHandler.ConnectedIds.TryGetValue(user.Id, out var cids))
                {
                    await Clients.Clients(cids).SendAsync("Answer", request);
                    await Clients.Clients(cids).SendAsync("Messages", messages);

                }

                if (UserHandler.ConnectedIds.TryGetValue(admin.Id, out var AdminCids))
                {
                    await Clients.Clients(AdminCids).SendAsync("Answer", request);
                    await Clients.Clients(AdminCids).SendAsync("Messages", messages);
                }

                await Clients.Group("Admin").SendAsync("ClientList", _QueueService.GetQueue());
                await Clients.Group("Admin").SendAsync("AdminList", _QueueService.GetAdmins());
            }
            catch (Exception e)
            {
                await Clients.Caller.SendAsync("Error", e.Message);
                Console.WriteLine(e.StackTrace);
            }

        }


        public async Task Reject(CallRequest request)
        {
            var user = await _Users.FindByIdAsync(request.UserId);

            var admin = await _Users.FindByIdAsync(request.AdminId);
           
            if (user == null)
            {
                return;
            }

            if (admin == null)
            {
                return;
            }

            admin.Status = UserStatus.Available;
            await _Users.UpdateAsync(admin);
            _QueueService.UpdateAdmin(admin);

            user.Status = UserStatus.Available;
            await _Users.UpdateAsync(user);
            _QueueService.UpdateUser(user);

            _QueueService.DestroyConnection(admin, user);

            var log = new CallLog
            {
                MessaId = _MessaService.GetCurrentMesseId(),
                EventTime = DateTime.Now,
                EventType = CallLogType.CancelledByUser,
                Admin = admin,
                User = user,
            };

            _ApplicationDbContext.CallLogs.Add(log);
            await _ApplicationDbContext.SaveChangesAsync();
            await SendCallLogs();
            if (UserHandler.ConnectedIds.TryGetValue(admin.Id, out var AdminCids))
            {
                await Clients.Clients(AdminCids).SendAsync("Rejected");
            }

            if (UserHandler.ConnectedIds.TryGetValue(user.Id, out var UserCids))
            {
                await Clients.Clients(UserCids).SendAsync("YourPosition", _QueueService.GetPosition(user.Id));
                await Clients.Clients(UserCids).SendAsync("Disconnect");
                await Clients.Clients(UserCids).SendAsync("YourStatus", user);
            }

            await Clients.Group("Admin").SendAsync("ClientList", _QueueService.GetQueue());
            await Clients.Group("Admin").SendAsync("AdminList", _QueueService.GetAdmins());

        }

        public async Task SendCallLogs()
        {
            var logs = _ApplicationDbContext.CallLogs.Include(log =>log.User).Include(log=> log.Admin).Where(log=> log.MessaId == _MessaService.GetCurrentMesseId()).ToList();
            await Clients.Group("Admin").SendAsync("CallLog", logs);
        }

        public async Task UpdateDetails(ApplicationUser userIn)
        {
            try
            {
                Console.WriteLine($"******** Updating Details for user ************");

                var userId = userIn.Id;
                Console.WriteLine("userId: " +userId);

                var user = await _Users.FindByIdAsync(userId);
                if (user == null){
                    throw new Exception("Couldn't find user");
                }

                    if (user.DisplayName != userIn.DisplayName)
                    {
                        user.DisplayName = userIn.DisplayName;
                    }
                    if (user.Email != userIn.Email)
                    {
                        user.Email = userIn.Email;
                    }
                    if (user.PhoneNumber != userIn.PhoneNumber)
                    {
                        user.PhoneNumber = userIn.PhoneNumber;
                    }
                    if (user.UserName != userIn.UserName)
                    {
                        user.UserName = userIn.UserName;
                    }
                    if (user.ContactMethod != userIn.ContactMethod)
                    {
                        user.ContactMethod = userIn.ContactMethod;
                    }
                    if (user.ContactSubject != userIn.ContactSubject)
                    {
                        user.ContactSubject = userIn.ContactSubject;
                    }
                    if (user.Status != userIn.Status)
                    {
                        user.Status = userIn.Status;
                    }

                    await _Users.UpdateAsync(user);
                    _QueueService.UpdateUser(user);

                    if (UserHandler.ConnectedIds.TryGetValue(user.Id, out var cids))
                    {
                        await Clients.Clients(cids).SendAsync("YourStatus", user);
                    }

                await Clients.Group("Admin").SendAsync("ClientList", _QueueService.GetQueue());

                

            }
            catch (Exception e)
            {
                await Clients.Caller.SendAsync("Error", e.Message);

            }
        }

        [Authorize]
        public async Task UpdateAdminDetails(ApplicationUser userIn)
        {
            try
            {

                var claimPrinciple = Context.User.FindFirst(c =>
                       c.Type == ClaimTypes.NameIdentifier);

                var user = await _Users.FindByIdAsync(claimPrinciple.Value);

                if (user == null || user.Id != userIn.Id)
                {
                    return;
                }
              
                if (user.DisplayName != userIn.DisplayName)
                {
                    user.DisplayName = userIn.DisplayName;
                }
                if (user.Email != userIn.Email)
                {
                    user.Email = userIn.Email;
                }
                if (user.PhoneNumber != userIn.PhoneNumber)
                {
                    user.PhoneNumber = userIn.PhoneNumber;
                }
                if (user.UserName != userIn.UserName)
                {
                    user.UserName = userIn.UserName;
                }
                if (user.ContactMethod != userIn.ContactMethod)
                {
                    user.ContactMethod = userIn.ContactMethod;
                }
                if (user.ContactSubject != userIn.ContactSubject)
                {
                    user.ContactSubject = userIn.ContactSubject;
                }
                if (user.Status != userIn.Status)
                {
                    user.Status = userIn.Status;
                }

                if (user.WherebyLink != userIn.WherebyLink)
                {
                    user.WherebyLink = userIn.WherebyLink;
                }

                await _Users.UpdateAsync(user);
                _QueueService.UpdateAdmin(user);
                _QueueService.GetStatus();

                if (UserHandler.ConnectedIds.TryGetValue(userIn.Id, out var cids))
                {
                    await Clients.Clients(cids).SendAsync("YourStatus", user);
                }

                await Clients.Group("Admin").SendAsync("ClientList", _QueueService.GetQueue());
                await Clients.Group("Admin").SendAsync("AdminList", _QueueService.GetAdmins());


            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                Console.WriteLine(e.StackTrace);
                await Clients.Caller.SendAsync("Error", e.Message);

            }
        }


        public async Task JoinQueue(ApplicationUser user)
        {
            if (user == null)
            {
                return;
            }

            _QueueService.AddUser(user);
            var queue = _QueueService.GetQueue();
            await Clients.Group("Admin").SendAsync("ClientList", queue);

            foreach(var queued in queue)
            {
                if (UserHandler.ConnectedIds.TryGetValue(queued.User.Id, out var cids))
                {
                    await Clients.Clients(cids).SendAsync("YourPosition", _QueueService.GetPosition(queued.User));
                }
            }
        }

        public async Task LeaveQueue(string userId)
        {
            try { 
           

                var User = await _Users.FindByIdAsync(userId);
            
                User.ContactMethod = ContactMethodType.Undefined;
                User.ContactSubject = ContactSubject.Undefined;

                await _Users.UpdateAsync(User);
                _QueueService.RemoveUser(User);
            
                if(UserHandler.ConnectedIds.TryGetValue(userId, out var item))
                {
                    await Clients.Clients(item).SendAsync("YourStatus", User);
                    await Clients.Clients(item).SendAsync("YourPosition", _QueueService.GetPosition(User));
                }

                var queue = _QueueService.GetQueue();
                await Clients.Group("Admin").SendAsync("ClientList", queue);
                foreach (var queued in queue)
                {
                    var cids = UserHandler.ConnectedIds[queued.User.Id];
                    await Clients.Clients(cids).SendAsync("YourPosition", _QueueService.GetPosition(queued.User));
                }
            }
            catch (Exception e)
            {
                await Clients.Caller.SendAsync("Error", e.Message);

            }
        }

        public async Task RemoveSelfFromGroup()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Users");
            //var user = _QueueService.GetUserByConnectionId(Context.ConnectionId);

           /* _QueueService.RemoveUser(user);
            var users = _QueueService.GetUsers();

            await Clients.Group("Users").SendAsync("QueueLengthUpdate", users.Count());
            await Clients.Group("Admin").SendAsync("Send", $"{Context.ConnectionId} has left the group Users.");
            await Clients.Group("Admin").SendAsync("ClientList", _QueueService.GetQueue());

           /* foreach (var qUser in users)
            {
                await Clients.Clients(_QueueService.UserIdToConnectionIds(qUser.Id)).SendAsync("YourPosition", _QueueService.GetPosition(qUser));
            }
            */
        }

        public async Task GetQueueUpdate()
        {
            await Clients.Caller.SendAsync("QueueLengthUpdate", _QueueService.GetUsers().Count());
        }

        public async Task GetMainStream()
        {
            await Clients.Caller.SendAsync("MainStreamUpdate", "https://www.youtube.com/embed/QddgFtWwn28");
        }


    }


    public class CustomerQueueObject
    {
        public string ConnectedAdmin { get; set; }
        public ApplicationUser Customer { get; set; }
        public DateTime LastActivity { get; set; }
        public int Position { get; set; }
    }


    public class CallRequest
    {
        [JsonPropertyName("userId")]

        public string UserId { get; set; }
        [JsonPropertyName("adminId")]

        public string AdminId { get; set; }
        [JsonPropertyName("adminEmail")]
        public string AdminEmail { get; set; }
        [JsonPropertyName("adminPhone")]
        public string AdminPhone { get; set; }
        [JsonPropertyName("adminDisplayName")]
        public string AdminDisplayName { get; set; }
        [JsonPropertyName("contactMethod")]
        public ContactMethodType ContactMethod { get; set; }
        [JsonPropertyName("wherebyLink")]
        public string WherebyLink { get; set; }
    }
}