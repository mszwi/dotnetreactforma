using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using DotnetReactFoma.Data;
using DotnetReactFoma.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using DotnetReactFoma.Hubs;
using DotnetReactFoma.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Threading.Tasks;
using System;
using IdentityServer4.Validation;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;

/*
 Server: 215
 Folder: w277461
*/


namespace DotnetReactFoma
{
    public class Startup
    {
        IWebHostEnvironment _env;
        public Startup(IConfiguration configuration, IWebHostEnvironment env)
        {
            Configuration = configuration;
            _env = env;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    Configuration.GetConnectionString("DefaultConnection")));

            services.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders()
                .AddPasswordlessLoginTotpTokenProvider(); // Add the custom token provider


            services.AddIdentityServer()
                .AddApiAuthorization<ApplicationUser, ApplicationDbContext>();

            services.AddAuthentication(options =>
            {
                // Identity made Cookie authentication the default.
                // However, we want JWT Bearer Auth to be the default.
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                if (_env.IsDevelopment())
                {
                    options.Authority = "https://localhost:44371/";

                }
                else
                {
                    options.Authority = "https://forhandler.foma.no";

                }
                // Configure the Authority to the expected value for your authentication provider
                // This ensures the token is appropriately validated
                //options.Authority = "https://messe.foma.no/";
                options.SaveToken = true;
                options.IncludeErrorDetails = true;
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    // These need to be set correctly after checking that it works
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuer = false,
                    ValidateIssuerSigningKey = false,
                    ValidateActor = false
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        Console.WriteLine(accessToken);
                        // If the request is for our hub...
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && (path.StartsWithSegments("/chatHub") || path.StartsWithSegments("/messaHub")))
                        {
                            Console.WriteLine("***** Settings access token *****");
                            // Read the token out of the query string
                            context.Token = accessToken;
                            context.HttpContext.Request.Headers.Add("Authorization", $"Bearer {accessToken}");

                        }
                        return Task.CompletedTask;
                    }
                };
            })
            .AddJwtBearer("Testing", options =>
            {
                options.Authority = "https://videostream.foma.no";
                options.SaveToken = true;
                options.IncludeErrorDetails = true;
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    // These need to be set correctly after checking that it works
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuer = false,
                    ValidateIssuerSigningKey = false,
                    ValidateActor = false
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        Console.WriteLine(accessToken);
                        // If the request is for our hub...
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && (path.StartsWithSegments("/chatHub") || path.StartsWithSegments("/messaHub")))
                        {
                            Console.WriteLine("***** Settings access token *****");
                            // Read the token out of the query string
                            context.Token = accessToken;
                            context.HttpContext.Request.Headers.Add("Authorization", $"Bearer {accessToken}");

                        }
                        return Task.CompletedTask;
                    }
                };
            }).AddIdentityServerJwt();

            services.AddAuthorization(options =>
            {
                var defaultAuthorizationPolicyBuilder = new AuthorizationPolicyBuilder(
                JwtBearerDefaults.AuthenticationScheme,
                "Testing");
                defaultAuthorizationPolicyBuilder =
                    defaultAuthorizationPolicyBuilder.RequireAuthenticatedUser();
                options.DefaultPolicy = defaultAuthorizationPolicyBuilder.Build();
            });

            services.AddSignalR();

            //services.AddSingleton<IUserIdProvider, EmailBasedUserIdProvider>();
            services.AddSingleton<IUserIdProvider, NameUserIdProvider>();
            services.AddSingleton<IQueueService, QueueService>();
            services.AddSingleton<IMessaService, MessaService>();

            services.AddControllersWithViews();
            services.AddRazorPages();


            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseIdentityServer();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<ChatHub>("/chatHub");
                endpoints.MapHub<MessaHub>("/messaHub");
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
                endpoints.MapRazorPages();
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
