using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Timers;
using DotnetReactFoma.Data;
using DotnetReactFoma.Hubs;
using DotnetReactFoma.Models;
using DotnetReactFoma.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DotnetReactFoma.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MessaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private UserManager<ApplicationUser> _Users;
        private readonly IMessaService _MessaService;
        private IHubContext<MessaHub> _MessaHub;
        private IQueueService _QueueService;

        public MessaController(IMessaService MS, ApplicationDbContext c, UserManager<ApplicationUser> usrs, IHubContext<MessaHub> hc, IQueueService qs)
        {
            _Users = usrs;
            _MessaService = MS;
            _context = c;
            _MessaHub = hc;
            _QueueService = qs;
        }

        [HttpGet("Ping")]
        public void Ping()
        {
            var timer = new Timer(5000);
            timer.Elapsed += (sender, e) => UpdateAll();
            timer.AutoReset = false;
            timer.Start();
            
        }

        public void UpdateAll()
        {
            
            var messe = _MessaService.GetCurrentMessa();
            _MessaHub.Clients.All.SendAsync("Settings", messe);
        }

        [HttpGet("Current")]
        public dynamic Current()
        {
           var result = _MessaService.GetCurrentMessa();
            return result;
        }

        [HttpPost("JoinCompetition")]
        public async Task<dynamic> JoinCompetition(CompetitionRequest Req)
        {
            try
            {
                var User = await _Users.FindByIdAsync(Req.UserId);

                if (User == null){
                    throw new Exception("Could not find a user assosiated with your request");
                }

                if (_context.CompetitionEntries.Any(e => e.Email == Req.Email && e.CompetitionId == Req.CompetitionId))
                {
                    throw new Exception("Du er alerede påmeldt i denne konkurranse");

                }

                var entry = new CompetitionEntry()
                {
                    Email = Req.Email,
                    CompetitionId = Req.CompetitionId,
                    PhoneNumber = Req.PhoneNumber,
                    User = User
                };
                _context.CompetitionEntries.Add(entry);

                await _context.SaveChangesAsync();
                return entry;
            }
            catch(Exception e)
            {
                return new { error = e.Message };
            }

        }

        [HttpPost("CompetitionEntries")]
        public dynamic CompetitionEntries(CompetitionRequest Req)
        {
            if(Req.Email == null)
            {
                return new List<string>();
            }

            var entries = _context.CompetitionEntries.Where(e => e.Email != null && e.Email == Req.Email);
            return entries;
              
        }

        public string CreateEmail()
        {
            var pieces = Guid.NewGuid().ToString().Split('-');
            return $"{pieces[0]}@{pieces[1]}.{pieces[2]}";
        }

        public string CreateName()
        {
            var pieces = Guid.NewGuid().ToString();
            return pieces;
        }

        [HttpGet("CreateAnonymousUser")]
        public async Task<ApplicationUser> CreateAnonymousUser()
        {
            Console.WriteLine("************ Creating a new User **********");

            var user = _QueueService.NewUser();
            var result = await _Users.CreateAsync(user);
            Console.WriteLine(result);
            Console.WriteLine($"************ Created user {user.Id} **********");

            /* await _Users.AddClaimAsync(user, new Claim(ClaimTypes.Email, user.Email));
             await _Users.AddClaimAsync(user, new Claim(ClaimTypes.Name, user.UserName));*/

            /*var token = await _Users.GetAuthenticationTokenAsync(user, "PasswordlessLoginTotpProvider", "passwordless-auth");*/
            //return token;
            return user;

        }
    }

    public class CompetitionRequest
    {
        public string UserId { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public int CompetitionId { get; set; }
    }
}
